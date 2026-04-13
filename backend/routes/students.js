const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentsController');
const { authenticateToken } = require('../middleware/auth');

const studentValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('class').trim().notEmpty().withMessage('Class is required'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Invalid email format'),
  body('phone').optional({ nullable: true, checkFalsy: true }).matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Invalid phone number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
];

// GET /api/students
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
], getAllStudents);

// GET /api/students/:id
router.get('/:id', authenticateToken, getStudentById);

// POST /api/students
router.post('/', authenticateToken, studentValidation, createStudent);

// PUT /api/students/:id
router.put('/:id', authenticateToken, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('rollNumber').optional().trim().notEmpty().withMessage('Roll number cannot be empty'),
  body('class').optional().trim().notEmpty().withMessage('Class cannot be empty'),
  body('section').optional().trim().notEmpty().withMessage('Section cannot be empty'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Invalid email format'),
  body('phone').optional({ nullable: true, checkFalsy: true }).matches(/^[0-9+\-\s()]{7,15}$/).withMessage('Invalid phone number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
], updateStudent);

// DELETE /api/students/:id
router.delete('/:id', authenticateToken, deleteStudent);

module.exports = router;
