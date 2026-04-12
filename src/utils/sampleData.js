export const sampleStudents = [
  {
    id: '1',
    name: 'Aarav Sharma',
    rollNumber: 'CS001',
    email: 'aarav.sharma@school.edu',
    phone: '9876543210',
    class: '10',
    section: 'A',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Priya Patel',
    rollNumber: 'CS002',
    email: 'priya.patel@school.edu',
    phone: '9876543211',
    class: '10',
    section: 'A',
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Rohan Verma',
    rollNumber: 'CS003',
    email: 'rohan.verma@school.edu',
    phone: '9876543212',
    class: '10',
    section: 'B',
    createdAt: '2024-01-16',
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    rollNumber: 'CS004',
    email: 'sneha.gupta@school.edu',
    phone: '9876543213',
    class: '10',
    section: 'A',
    createdAt: '2024-01-16',
  },
  {
    id: '5',
    name: 'Arjun Singh',
    rollNumber: 'CS005',
    email: 'arjun.singh@school.edu',
    phone: '9876543214',
    class: '10',
    section: 'B',
    createdAt: '2024-01-17',
  },
];

export const generateSampleAttendance = (students) => {
  const attendance = {};
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    attendance[dateStr] = {};
    students.forEach(student => {
      const rand = Math.random();
      if (rand < 0.85) {
        attendance[dateStr][student.id] = 'present';
      } else if (rand < 0.95) {
        attendance[dateStr][student.id] = 'absent';
      } else {
        attendance[dateStr][student.id] = 'leave';
      }
    });
  }
  
  return attendance;
};
