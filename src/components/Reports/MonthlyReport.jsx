import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAttendance } from '../../context/AttendanceContext';
import { getMonthName } from '../../utils/dateUtils';
import { exportToCSV, generateAttendanceCSV } from '../../utils/exportUtils';
import Button from '../UI/Button';
import Badge from '../UI/Badge';

const MonthlyReport = () => {
  const { students } = useStudents();
  const { attendance, getAttendanceSummary } = useAttendance();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const summaries = useMemo(() => students.map(student => ({
    ...student,
    ...getAttendanceSummary(student.id, month, year),
  })), [students, month, year, getAttendanceSummary]);

  const overallStats = useMemo(() => {
    if (summaries.length === 0) return { avgAttendance: 0, highRisk: 0, goodAttendance: 0, totalDays: 0 };
    const totalPct = summaries.reduce((sum, s) => sum + parseFloat(s.percentage), 0);
    return {
      avgAttendance: (totalPct / summaries.length).toFixed(1),
      highRisk: summaries.filter(s => parseFloat(s.percentage) < 75).length,
      goodAttendance: summaries.filter(s => parseFloat(s.percentage) >= 90).length,
      totalDays: Math.max(...summaries.map(s => s.total), 0),
    };
  }, [summaries]);

  const handleExport = () => {
    const csv = generateAttendanceCSV(students, attendance, month, year);
    exportToCSV(csv, `attendance_${getMonthName(month)}_${year}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="input-field w-36"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{getMonthName(i)}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-24">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{overallStats.avgAttendance}%</div>
          <div className="text-sm text-gray-500 mt-1">Average Attendance</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-700">{overallStats.totalDays}</div>
          <div className="text-sm text-gray-500 mt-1">Working Days</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
            <Award size={24} />{overallStats.goodAttendance}
          </div>
          <div className="text-sm text-gray-500 mt-1">≥90% Attendance</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-500 flex items-center justify-center gap-1">
            <AlertTriangle size={24} />{overallStats.highRisk}
          </div>
          <div className="text-sm text-gray-500 mt-1">Below 75%</div>
        </div>
      </div>

      {/* Student Report Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Leave</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Days</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map(student => {
              const pct = parseFloat(student.percentage);
              const statusLabel = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : pct >= 50 ? 'Average' : 'At Risk';
              const statusVariant = pct >= 90 ? 'present' : pct >= 75 ? 'info' : pct >= 50 ? 'leave' : 'absent';
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.rollNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.class}{student.section}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-green-700">{student.present}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-red-600">{student.absent}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-yellow-600">{student.leave}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{student.total}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{student.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReport;
