require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const sampleStudents = [
  { name: 'Aarav Kumar', rollNumber: 'CS001', email: 'aarav.kumar@school.edu', phone: '9876543210', class: '10', section: 'A' },
  { name: 'Priya Sharma', rollNumber: 'CS002', email: 'priya.sharma@school.edu', phone: '9876543211', class: '10', section: 'A' },
  { name: 'Rohan Mehta', rollNumber: 'CS003', email: 'rohan.mehta@school.edu', phone: '9876543212', class: '10', section: 'B' },
  { name: 'Sneha Gupta', rollNumber: 'CS004', email: 'sneha.gupta@school.edu', phone: '9876543213', class: '10', section: 'A' },
  { name: 'Arjun Singh', rollNumber: 'CS005', email: 'arjun.singh@school.edu', phone: '9876543214', class: '10', section: 'B' },
  { name: 'Meera Nair', rollNumber: 'CS006', email: 'meera.nair@school.edu', phone: '9876543215', class: '11', section: 'A' },
  { name: 'Vivek Patel', rollNumber: 'CS007', email: 'vivek.patel@school.edu', phone: '9876543216', class: '11', section: 'B' },
];

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@school.edu');
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 12);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)')
      .run('admin', 'admin@school.edu', hashed, 'admin', now);
    console.log('Created admin user: admin@school.edu / admin123');
  }

  // Create sample students
  const now = new Date().toISOString();
  const insertStmt = db.prepare(
    `INSERT OR IGNORE INTO students (name, roll_number, email, phone, class, section, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
  );

  for (const s of sampleStudents) {
    insertStmt.run(s.name, s.rollNumber, s.email, s.phone, s.class, s.section, now, now);
  }
  console.log(`Seeded ${sampleStudents.length} students`);

  // Generate sample attendance for last 30 days
  const students = db.prepare('SELECT id FROM students').all();
  const insertAttendance = db.prepare(`
    INSERT OR IGNORE INTO attendance (student_id, date, status, created_at) VALUES (?, ?, ?, ?)
  `);

  const statuses = ['present', 'present', 'present', 'present', 'present', 'absent', 'leave'];
  let attendanceCount = 0;

  const insertMany = db.transaction(() => {
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const day = date.getDay();
      if (day === 0 || day === 6) continue;
      const dateStr = date.toISOString().split('T')[0];

      for (const s of students) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        insertAttendance.run(s.id, dateStr, status, now);
        attendanceCount++;
      }
    }
  });

  insertMany();
  console.log(`Seeded ${attendanceCount} attendance records`);
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
