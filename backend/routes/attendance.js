const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAttendanceByDate,
  getStudentAttendance,
  markAttendance,
  updateAttendance,
  getMonthlyAttendance,
  markBulkAttendance,
} = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

const statusValues = ['present', 'absent', 'leave'];

// GET /api/attendance/date/:date
router.get('/date/:date', authenticateToken, getAttendanceByDate);

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', authenticateToken, getStudentAttendance);

// GET /api/attendance/monthly/:year/:month
router.get('/monthly/:year/:month', authenticateToken, getMonthlyAttendance);

// POST /api/attendance
router.post('/', authenticateToken, [
  body('studentId').notEmpty().withMessage('studentId is required'),
  body('date').isISO8601().withMessage('date must be a valid date (YYYY-MM-DD)'),
  body('status').isIn(statusValues).withMessage(`status must be one of: ${statusValues.join(', ')}`),
  body('remarks').optional({ nullable: true }).isString(),
], markAttendance);

// PUT /api/attendance/:id
router.put('/:id', authenticateToken, [
  body('status').optional().isIn(statusValues).withMessage(`status must be one of: ${statusValues.join(', ')}`),
  body('remarks').optional({ nullable: true }).isString(),
], updateAttendance);

// POST /api/attendance/bulk
router.post('/bulk', authenticateToken, [
  body('date').isISO8601().withMessage('date must be a valid date (YYYY-MM-DD)'),
  body('records').isArray({ min: 1 }).withMessage('records must be a non-empty array'),
  body('records.*.studentId').notEmpty().withMessage('Each record must have a studentId'),
  body('records.*.status').isIn(statusValues).withMessage(`Each record status must be one of: ${statusValues.join(', ')}`),
], markBulkAttendance);

module.exports = router;
