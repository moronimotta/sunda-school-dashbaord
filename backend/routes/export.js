import express from 'express';
import { exportToGoogleSheets, exportDateToGoogleSheets } from '../services/googleSheets.js';

const router = express.Router();

// Export all attendance data to Google Sheets
router.post('/export-all', async (req, res) => {
  try {
    const { startDate, endDate, spreadsheetId, sheetName } = req.body;
    
    const result = await exportToGoogleSheets(
      startDate,
      endDate,
      spreadsheetId,
      sheetName
    );
    
    res.json({
      success: true,
      message: 'Data exported successfully to Google Sheets',
      ...result
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to export to Google Sheets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export specific date attendance to Google Sheets
router.post('/export-date', async (req, res) => {
  try {
    const { date, spreadsheetId } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }
    
    const result = await exportDateToGoogleSheets(date, spreadsheetId);
    
    res.json({
      success: true,
      message: 'Date attendance exported successfully',
      ...result
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to export to Google Sheets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if Google Sheets is configured
router.get('/status', (req, res) => {
  const isConfigured = !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
  );
  
  res.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Google Sheets integration is configured'
      : 'Google Sheets credentials not found. Please configure GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY'
  });
});

export default router;
