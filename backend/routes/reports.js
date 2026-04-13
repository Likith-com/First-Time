const express = require('express');
const router = express.Router();
const { getMonthlyReport, getStudentReport, getOverallSummary, exportCSV } = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports/summary
router.get('/summary', authenticateToken, getOverallSummary);

// GET /api/reports/monthly/:year/:month
router.get('/monthly/:year/:month', authenticateToken, getMonthlyReport);

// GET /api/reports/student/:studentId
router.get('/student/:studentId', authenticateToken, getStudentReport);

// GET /api/reports/export/csv
router.get('/export/csv', authenticateToken, exportCSV);

module.exports = router;
