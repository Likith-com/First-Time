export const exportToCSV = (data, filename) => {
  const csvContent = 'data:text/csv;charset=utf-8,' + data;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateAttendanceCSV = (students, attendance, month, year) => {
  const monthDates = Object.keys(attendance).filter(date => {
    const d = new Date(date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).sort();

  const headers = ['Roll No', 'Name', 'Class', 'Section', ...monthDates.map(d => {
    const date = new Date(d + 'T00:00:00');
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }), 'Present', 'Absent', 'Leave', 'Attendance %'];

  const rows = students.map(student => {
    let present = 0, absent = 0, leave = 0;
    const dateStatuses = monthDates.map(date => {
      const status = attendance[date]?.[student.id] || '-';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'leave') leave++;
      return status.charAt(0).toUpperCase();
    });
    const total = present + absent + leave;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
    return [student.rollNumber, student.name, student.class, student.section, ...dateStatuses, present, absent, leave, `${percentage}%`];
  });

  const csvData = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csvData;
};
