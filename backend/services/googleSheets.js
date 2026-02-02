import { google } from 'googleapis';
import prisma from '../lib/prisma.js';
import { format } from 'date-fns';

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  try {
    // Option 1: Using service account JSON (recommended for server)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    }
    
    // Option 2: Using individual credentials
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    }
    
    throw new Error('Google Sheets credentials not configured');
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    throw error;
  }
};

// Export attendance data to Google Sheets
export const exportToGoogleSheets = async (startDate, endDate, spreadsheetId, sheetName = 'Attendance Report') => {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Get attendance records with member details
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: { member: true },
      orderBy: [
        { date: 'asc' },
        { member: { name: 'asc' } }
      ]
    });

    // Group by date
    const dateGroups = {};
    attendanceRecords.forEach(record => {
      const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = [];
      }
      dateGroups[dateKey].push(record);
    });

    // Prepare data for sheets
    const rows = [];
    
    // Header row
    rows.push([
      'Date',
      'Name',
      'Gender',
      'Category',
      'Present',
      'Read Assignment',
      'Email',
      'Phone'
    ]);

    // Data rows
    Object.keys(dateGroups).sort().forEach(date => {
      dateGroups[date].forEach(record => {
        rows.push([
          format(new Date(record.date), 'MMM dd, yyyy'),
          record.member.name,
          record.member.gender,
          record.member.category.replace('_', ' '),
          record.present ? 'Yes' : 'No',
          record.readAssignment ? 'Yes' : 'No',
          record.member.email || '',
          record.member.phone || ''
        ]);
      });
    });

    // Add summary section
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.present).length;
    const presentRecords = attendanceRecords.filter(r => r.present);
    const readCount = presentRecords.filter(r => r.readAssignment).length;
    const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
    const readingRate = presentCount > 0 ? ((readCount / presentCount) * 100).toFixed(1) : 0;

    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Records:', totalRecords]);
    rows.push(['Present Count:', presentCount]);
    rows.push(['Attendance Rate:', `${attendanceRate}%`]);
    rows.push(['Read Assignment:', readCount]);
    rows.push(['Reading Rate:', `${readingRate}%`]);

    // Check if spreadsheet exists, if not create it
    let targetSpreadsheetId = spreadsheetId;
    
    if (!targetSpreadsheetId) {
      // Create new spreadsheet
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Sunday School Attendance - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
          },
          sheets: [{
            properties: {
              title: sheetName,
            }
          }]
        }
      });
      targetSpreadsheetId = createResponse.data.spreadsheetId;
    } else {
      // Try to add a new sheet or clear existing one
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: targetSpreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: sheetName,
                }
              }
            }]
          }
        });
      } catch (error) {
        // Sheet might already exist, clear it instead
        await sheets.spreadsheets.values.clear({
          spreadsheetId: targetSpreadsheetId,
          range: `${sheetName}!A:Z`,
        });
      }
    }

    // Write data to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    // Format the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: targetSpreadsheetId,
      requestBody: {
        requests: [
          {
            // Make header row bold
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            // Auto-resize columns
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 8,
              },
            },
          },
        ],
      },
    });

    return {
      spreadsheetId: targetSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`,
      rowsWritten: rows.length,
    };
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw error;
  }
};

// Export current attendance for a specific date
export const exportDateToGoogleSheets = async (date, spreadsheetId) => {
  try {
    const sheets = getGoogleSheetsClient();
    const sheetName = `Attendance ${format(new Date(date), 'MMM dd yyyy')}`;
    
    // Get all members
    const members = await prisma.member.findMany({
      orderBy: { name: 'asc' }
    });

    // Get attendance for this date
    const attendanceRecords = await prisma.attendance.findMany({
      where: { date: new Date(date) },
      include: { member: true }
    });

    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.memberId] = record;
    });

    // Prepare data
    const rows = [];
    
    // Header
    rows.push([
      'Name',
      'Gender',
      'Category',
      'Present',
      'Read Assignment'
    ]);

    // Data rows for all members
    members.forEach(member => {
      const attendance = attendanceMap[member.id];
      rows.push([
        member.name,
        member.gender,
        member.category.replace('_', ' '),
        attendance?.present ? 'Yes' : 'No',
        attendance?.readAssignment ? 'Yes' : 'No'
      ]);
    });

    // Summary
    const presentCount = Object.values(attendanceMap).filter(a => a.present).length;
    const readCount = Object.values(attendanceMap).filter(a => a.readAssignment).length;
    
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Members:', members.length]);
    rows.push(['Present:', presentCount]);
    rows.push(['Attendance Rate:', `${((presentCount / members.length) * 100).toFixed(1)}%`]);
    rows.push(['Read Assignment:', readCount]);

    // Create or update sheet
    let targetSpreadsheetId = spreadsheetId;
    
    if (!targetSpreadsheetId) {
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Sunday School - ${sheetName}`,
          }
        }
      });
      targetSpreadsheetId = createResponse.data.spreadsheetId;
    }

    // Write data
    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: rows,
      },
    });

    return {
      spreadsheetId: targetSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`,
      rowsWritten: rows.length,
    };
  } catch (error) {
    console.error('Error exporting date to Google Sheets:', error);
    throw error;
  }
};
