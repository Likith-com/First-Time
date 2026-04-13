const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, logout, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('Role must be admin, teacher, or student'),
], register);

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
