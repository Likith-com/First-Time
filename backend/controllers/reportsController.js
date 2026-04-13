const db = require('../config/database');

const getMonthlyReport = (req, res, next) => {
  try {
    const { year, month } = req.params;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const students = db.prepare('SELECT * FROM students WHERE status = ?').all('active');
    const attendanceRows = db.prepare(`
      SELECT student_id, status, COUNT(*) as count
      FROM attendance
      WHERE strftime('%Y-%m', date) = ?
      GROUP BY student_id, status
    `).all(monthStr);

    const totalDays = db.prepare(
      `SELECT COUNT(DISTINCT date) as days FROM attendance WHERE strftime('%Y-%m', date) = ?`
    ).get(monthStr).days;

    const studentMap = {};
    for (const s of students) {
      studentMap[s.id] = {
        id: s.id,
        name: s.name,
        rollNumber: s.roll_number,
        class: s.class,
        section: s.section,
        present: 0,
        absent: 0,
        leave: 0,
        total: totalDays,
        percentage: 0,
      };
    }

    for (const row of attendanceRows) {
      if (studentMap[row.student_id]) {
        studentMap[row.student_id][row.status] = row.count;
      }
    }

    const report = Object.values(studentMap).map((s) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    res.json({ success: true, data: report, month: monthStr, totalWorkingDays: totalDays });
  } catch (err) {
    next(err);
  }
};

const getStudentReport = (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const summary = db.prepare(`
      SELECT status, COUNT(*) as count FROM attendance WHERE student_id = ? GROUP BY status
    `).all(studentId);

    const counts = { present: 0, absent: 0, leave: 0 };
    for (const row of summary) counts[row.status] = row.count;
    const total = counts.present + counts.absent + counts.leave;

    const monthlyBreakdown = db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave,
        COUNT(*) as total
      FROM attendance WHERE student_id = ?
      GROUP BY month ORDER BY month DESC
    `).all(studentId);

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          rollNumber: student.roll_number,
          class: student.class,
          section: student.section,
        },
        summary: {
          ...counts,
          total,
          percentage: total > 0 ? Math.round((counts.present / total) * 100) : 0,
        },
        monthlyBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getOverallSummary = (req, res, next) => {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE status = ?').get('active').count;
    const today = new Date().toISOString().split('T')[0];

    const todayStats = db.prepare(`
      SELECT status, COUNT(*) as count FROM attendance WHERE date = ? GROUP BY status
    `).all(today);

    const todayCounts = { present: 0, absent: 0, leave: 0 };
    for (const row of todayStats) todayCounts[row.status] = row.count;

    const currentMonth = today.slice(0, 7);
    const monthStats = db.prepare(`
      SELECT status, COUNT(*) as count FROM attendance
      WHERE strftime('%Y-%m', date) = ? GROUP BY status
    `).all(currentMonth);

    const monthCounts = { present: 0, absent: 0, leave: 0 };
    for (const row of monthStats) monthCounts[row.status] = row.count;
    const monthTotal = monthCounts.present + monthCounts.absent + monthCounts.leave;

    res.json({
      success: true,
      data: {
        totalStudents,
        today: { date: today, ...todayCounts },
        currentMonth: {
          month: currentMonth,
          ...monthCounts,
          total: monthTotal,
          attendanceRate: monthTotal > 0 ? Math.round((monthCounts.present / monthTotal) * 100) : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const exportCSV = (req, res, next) => {
  try {
    const { startDate, endDate, class: cls, section } = req.query;

    const conditions = [];
    const params = [];

    if (startDate) { conditions.push('a.date >= ?'); params.push(startDate); }
    if (endDate) { conditions.push('a.date <= ?'); params.push(endDate); }
    if (cls) { conditions.push('s.class = ?'); params.push(cls); }
    if (section) { conditions.push('s.section = ?'); params.push(section); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const rows = db.prepare(`
      SELECT s.name, s.roll_number, s.class, s.section, a.date, a.status, a.remarks
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      ${where}
      ORDER BY a.date, s.name
    `).all(...params);

    const headers = ['Name', 'Roll Number', 'Class', 'Section', 'Date', 'Status', 'Remarks'];
    const csvRows = [
      headers.join(','),
      ...rows.map((r) =>
        [r.name, r.roll_number, r.class, r.section, r.date, r.status, r.remarks || '']
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    next(err);
  }
};

module.exports = { getMonthlyReport, getStudentReport, getOverallSummary, exportCSV };
