import React, { useState, useMemo } from 'react';
import { useStudents } from '../../context/StudentContext';
import { useAttendance } from '../../context/AttendanceContext';
import { formatDateShort, getMonthName, getDatesInMonth } from '../../utils/dateUtils';
import Badge from '../UI/Badge';

const AttendanceHistory = () => {
  const { students } = useStudents();
  const { attendance, getAttendanceSummary } = useAttendance();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedStudent, setSelectedStudent] = useState('');

  const workingDays = useMemo(() => getDatesInMonth(year, month), [year, month]);
  
  const filteredStudents = useMemo(() => {
    if (selectedStudent) return students.filter(s => s.id === selectedStudent);
    return students;
  }, [students, selectedStudent]);

  const getStatus = (studentId, date) => {
    return attendance[date]?.[studentId] || null;
  };

  const statusColors = {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    leave: 'bg-yellow-500',
  };

  const handlePrevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 border border-gray-200">‹</button>
          <span className="font-medium text-gray-900 w-36 text-center">{getMonthName(month)} {year}</span>
          <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 border border-gray-200">›</button>
        </div>
        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input-field w-52">
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase z-10">Student</th>
              {workingDays.map(date => (
                <th key={date} className="px-2 py-3 text-center text-xs font-medium text-gray-500 min-w-[36px]">
                  {formatDateShort(date).split(' ')[1]}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">%</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">P</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">A</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">L</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredStudents.map(student => {
              const summary = getAttendanceSummary(student.id, month, year);
              const pct = parseFloat(summary.percentage);
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-2 z-10">
                    <div className="text-sm font-medium text-gray-900 whitespace-nowrap">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.rollNumber}</div>
                  </td>
                  {workingDays.map(date => {
                    const status = getStatus(student.id, date);
                    return (
                      <td key={date} className="px-2 py-2 text-center">
                        <div className={`w-5 h-5 rounded-sm mx-auto ${status ? statusColors[status] : 'bg-gray-200'}`} title={status || 'not marked'} />
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-center">
                    <Badge variant={pct >= 75 ? 'present' : pct >= 50 ? 'leave' : 'absent'}>{summary.percentage}%</Badge>
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-green-700 font-medium">{summary.present}</td>
                  <td className="px-4 py-2 text-center text-sm text-red-700 font-medium">{summary.absent}</td>
                  <td className="px-4 py-2 text-center text-sm text-yellow-700 font-medium">{summary.leave}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Present</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Absent</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> Leave</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Not Marked</span>
      </div>
    </div>
  );
};

export default AttendanceHistory;
