import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const { date, memberId } = req.query;
    let where = {};
    
    if (date) {
      where.date = new Date(date);
    }
    if (memberId) {
      where.memberId = parseInt(memberId);
    }
    
    const attendance = await prisma.attendance.findMany({
      where,
      include: { member: true },
      orderBy: { date: 'desc' }
    });
    
    // Format for frontend compatibility
    const formattedAttendance = attendance.map(record => ({
      ...record,
      _id: record.id.toString(),
      memberId: {
        ...record.member,
        _id: record.member.id.toString(),
        gender: record.member.gender.toLowerCase(),
        category: record.member.category.toLowerCase().replace('_', '-')
      }
    }));
    
    res.json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const attendance = await prisma.attendance.findMany({
      where: { date },
      include: { member: true },
      orderBy: { member: { name: 'asc' } }
    });
    
    // Format for frontend compatibility
    const formattedAttendance = attendance.map(record => ({
      ...record,
      _id: record.id.toString(),
      memberId: {
        ...record.member,
        _id: record.member.id.toString(),
        gender: record.member.gender.toLowerCase(),
        category: record.member.category.toLowerCase().replace('_', '-')
      }
    }));
    
    res.json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update attendance record
router.post('/', async (req, res) => {
  try {
    const { memberId, date, present, readAssignment } = req.body;
    const parsedMemberId = typeof memberId === 'string' && memberId.match(/^\d+$/) 
      ? parseInt(memberId) 
      : memberId;
    
    // Check if attendance already exists for this member and date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        memberId_date: {
          memberId: parsedMemberId,
          date: new Date(date)
        }
      },
      include: { member: true }
    });
    
    if (existingAttendance) {
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          present,
          readAssignment
        },
        include: { member: true }
      });
      
      const formattedRecord = {
        ...updated,
        _id: updated.id.toString(),
        memberId: {
          ...updated.member,
          _id: updated.member.id.toString(),
          gender: updated.member.gender.toLowerCase(),
          category: updated.member.category.toLowerCase().replace('_', '-')
        }
      };
      
      return res.json(formattedRecord);
    }
    
    const attendance = await prisma.attendance.create({
      data: {
        memberId: parsedMemberId,
        date: new Date(date),
        present,
        readAssignment
      },
      include: { member: true }
    });
    
    const formattedRecord = {
      ...attendance,
      _id: attendance.id.toString(),
      memberId: {
        ...attendance.member,
        _id: attendance.member.id.toString(),
        gender: attendance.member.gender.toLowerCase(),
        category: attendance.member.category.toLowerCase().replace('_', '-')
      }
    };
    
    res.status(201).json(formattedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk create/update attendance for a date
router.post('/bulk', async (req, res) => {
  try {
    const { date, records } = req.body;
    
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid request: date and records array required' });
    }

    const targetDate = new Date(date);
    
    // Delete existing records for this date, then create all new ones
    await prisma.attendance.deleteMany({
      where: { date: targetDate }
    });

    // Create all new records
    const dataToInsert = records.map(record => ({
      memberId: typeof record.memberId === 'string' && record.memberId.match(/^\d+$/)
        ? parseInt(record.memberId)
        : record.memberId,
      date: targetDate,
      present: record.present,
      readAssignment: record.readAssignment
    }));

    const result = await prisma.attendance.createMany({
      data: dataToInsert
    });
    
    res.json({ 
      message: 'Attendance records saved successfully', 
      count: result.count,
      success: true
    });
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }
    
    // Overall stats should only count REGULAR members
    const totalMembers = await prisma.member.count({ where: { category: 'REGULAR' } });
    const maleMembers = await prisma.member.count({ where: { category: 'REGULAR', gender: 'MALE' } });
    const femaleMembers = await prisma.member.count({ where: { category: 'REGULAR', gender: 'FEMALE' } });
    const templePrepMembers = await prisma.member.count({ where: { category: 'TEMPLE_PREP' } });
    const missionPrepMembers = await prisma.member.count({ where: { category: 'MISSION_PREP' } });
    
    // Get attendance records with member details
    const attendanceRecords = await prisma.attendance.findMany({
      where: dateFilter,
      include: { member: true }
    });

    // Get unique dates in the query range
    const uniqueDates = new Set(attendanceRecords.map((a) => a.date.toISOString().slice(0, 10)));
    const dateCount = uniqueDates.size;

    // Total possible attendance slots (REGULAR only)
    const totalAttendanceSlots = dateCount > 0 ? totalMembers * dateCount : 0;
    
    // Temple Prep and Mission Prep schedules (every Sunday)
    // Temple Prep: 5 weeks (Feb 15, 22, Mar 1, 8, 15)
    // Mission Prep: 8 weeks (Feb 15, 22, Mar 1, 8, 15, 22, 29, Apr 5)
    const templePrepDates = [
      '2026-02-15', '2026-02-22', '2026-03-01', '2026-03-08', '2026-03-15'
    ];
    const missionPrepDates = [
      '2026-02-15', '2026-02-22', '2026-03-01', '2026-03-08', 
      '2026-03-15', '2026-03-22', '2026-03-29', '2026-04-05'
    ];
    
    // Calculate how many dates in the query range
    let templePrepWeekCount = 0;
    let missionPrepWeekCount = 0;
    
    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().slice(0, 10);
      const end = new Date(endDate).toISOString().slice(0, 10);
      
      templePrepWeekCount = templePrepDates.filter(d => d >= start && d <= end).length;
      missionPrepWeekCount = missionPrepDates.filter(d => d >= start && d <= end).length;
    } else {
      // If no date filter, use full schedule
      templePrepWeekCount = templePrepDates.length;
      missionPrepWeekCount = missionPrepDates.length;
    }
    
    // Calculate statistics
    // Split attendance into REGULAR and PREP (Temple/Mission)
    const regularAttendance = attendanceRecords.filter(a => a.member?.category === 'REGULAR');
    const presentRegular = regularAttendance.filter(a => a.present);
    const stats = {
      totalMembers,
      maleMembers,
      femaleMembers,
      templePrepMembers,
      missionPrepMembers,
      totalAttendanceRecords: totalAttendanceSlots,
      presentCount: presentRegular.length,
      readAssignmentCount: presentRegular.filter(a => a.readAssignment).length,
      maleAttendance: presentRegular.filter(a => a.member?.gender === 'MALE').length,
      femaleAttendance: presentRegular.filter(a => a.member?.gender === 'FEMALE').length,
      templePrepAttendance: attendanceRecords.filter(a => a.present && a.member?.category === 'TEMPLE_PREP').length,
      missionPrepAttendance: attendanceRecords.filter(a => a.present && a.member?.category === 'MISSION_PREP').length,
      datesIncluded: dateCount,
      templePrepWeeks: templePrepWeekCount,
      missionPrepWeeks: missionPrepWeekCount
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    await prisma.attendance.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
