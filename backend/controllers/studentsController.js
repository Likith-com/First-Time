const db = require('../config/database');
const { validationResult } = require('express-validator');

const formatStudent = (row) => ({
  id: row.id,
  name: row.name,
  rollNumber: row.roll_number,
  email: row.email,
  phone: row.phone,
  class: row.class,
  section: row.section,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAllStudents = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { page = 1, limit = 10, class: cls, section, status, search, sort = 'name', order = 'asc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const allowedSort = ['name', 'roll_number', 'class', 'section', 'created_at'];
    const sortCol = allowedSort.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params = [];

    if (cls) { conditions.push('class = ?'); params.push(cls); }
    if (section) { conditions.push('section = ?'); params.push(section); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (search) {
      conditions.push('(name LIKE ? OR roll_number LIKE ? OR email LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) as count FROM students ${where}`).get(...params).count;
    const rows = db.prepare(
      `SELECT * FROM students ${where} ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`
    ).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: rows.map(formatStudent),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getStudentById = (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: formatStudent(row) });
  } catch (err) {
    next(err);
  }
};

const createStudent = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, rollNumber, email, phone, class: cls, section, status = 'active' } = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(
      `INSERT INTO students (name, roll_number, email, phone, class, section, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(name, rollNumber, email || null, phone || null, cls, section, status, now, now);
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: formatStudent(row) });
  } catch (err) {
    next(err);
  }
};

const updateStudent = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Student not found' });

    const { name, rollNumber, email, phone, class: cls, section, status } = req.body;
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE students SET
        name = ?, roll_number = ?, email = ?, phone = ?, class = ?, section = ?, status = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      name ?? existing.name,
      rollNumber ?? existing.roll_number,
      email !== undefined ? email : existing.email,
      phone !== undefined ? phone : existing.phone,
      cls ?? existing.class,
      section ?? existing.section,
      status ?? existing.status,
      now,
      req.params.id
    );

    const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: formatStudent(row) });
  } catch (err) {
    next(err);
  }
};

const deleteStudent = (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM students WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Student not found' });

    db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent };
