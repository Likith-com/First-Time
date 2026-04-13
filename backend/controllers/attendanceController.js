const db = require('../config/database');
const { validationResult } = require('express-validator');

const formatRecord = (row) => ({
  id: row.id,
  studentId: row.student_id,
  date: row.date,
  status: row.status,
  remarks: row.remarks,
  createdAt: row.created_at,
});

const formatRecordWithStudent = (row) => ({
  ...formatRecord(row),
  student: row.student_name ? {
    id: row.student_id,
    name: row.student_name,
    rollNumber: row.roll_number,
    class: row.class,
    section: row.section,
  } : undefined,
});

const getAttendanceByDate = (req, res, next) => {
  try {
    const { date } = req.params;
    const { class: cls, section } = req.query;

    const conditions = ['a.date = ?'];
    const params = [date];

    if (cls) { conditions.push('s.class = ?'); params.push(cls); }
    if (section) { conditions.push('s.section = ?'); params.push(section); }

    const rows = db.prepare(`
      SELECT a.*, s.name as student_name, s.roll_number, s.class, s.section
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY s.name
    `).all(...params);

    res.json({ success: true, data: rows.map(formatRecordWithStudent), date });
  } catch (err) {
    next(err);
  }
};

const getStudentAttendance = (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const conditions = ['student_id = ?'];
    const params = [studentId];

    if (startDate) { conditions.push('date >= ?'); params.push(startDate); }
    if (endDate) { conditions.push('date <= ?'); params.push(endDate); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const total = db.prepare(`SELECT COUNT(*) as count FROM attendance ${where}`).get(...params).count;
    const rows = db.prepare(
      `SELECT * FROM attendance ${where} ORDER BY date DESC LIMIT ? OFFSET ?`
    ).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: rows.map(formatRecord),
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const markAttendance = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { studentId, date, status, remarks } = req.body;

    const student = db.prepare('SELECT id FROM students WHERE id = ?').get(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO attendance (student_id, date, status, remarks, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status, remarks = excluded.remarks
    `);
    stmt.run(studentId, date, status, remarks || null, now);

    const row = db.prepare('SELECT * FROM attendance WHERE student_id = ? AND date = ?').get(studentId, date);
    res.status(201).json({ success: true, data: formatRecord(row) });
  } catch (err) {
    next(err);
  }
};

const updateAttendance = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const existing = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Attendance record not found' });

    const { status, remarks } = req.body;
    db.prepare('UPDATE attendance SET status = ?, remarks = ? WHERE id = ?').run(
      status ?? existing.status,
      remarks !== undefined ? remarks : existing.remarks,
      req.params.id
    );

    const row = db.prepare('SELECT * FROM attendance WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: formatRecord(row) });
  } catch (err) {
    next(err);
  }
};

const getMonthlyAttendance = (req, res, next) => {
  try {
    const { year, month } = req.params;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const rows = db.prepare(`
      SELECT a.*, s.name as student_name, s.roll_number, s.class, s.section
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE strftime('%Y-%m', a.date) = ?
      ORDER BY a.date, s.name
    `).all(monthStr);

    res.json({ success: true, data: rows.map(formatRecordWithStudent), month: monthStr });
  } catch (err) {
    next(err);
  }
};

const markBulkAttendance = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { date, records } = req.body;
    const now = new Date().toISOString();

    const insertMany = db.transaction((entries) => {
      const stmt = db.prepare(`
        INSERT INTO attendance (student_id, date, status, remarks, created_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status, remarks = excluded.remarks
      `);
      for (const entry of entries) {
        stmt.run(entry.studentId, date, entry.status, entry.remarks || null, now);
      }
    });

    insertMany(records);
    const saved = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE date = ?').get(date).count;
    res.json({ success: true, message: `Attendance saved for ${records.length} students`, date, total: saved });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAttendanceByDate,
  getStudentAttendance,
  markAttendance,
  updateAttendance,
  getMonthlyAttendance,
  markBulkAttendance,
};
