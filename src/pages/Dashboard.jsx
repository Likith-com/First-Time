import React, { useMemo } from 'react';
import { Users, CheckCircle, XCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import { useAttendance } from '../context/AttendanceContext';
import { getTodayString, formatDate, getMonthName } from '../utils/dateUtils';
import Badge from '../components/UI/Badge';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { students } = useStudents();
  const { getAttendanceForDate, getAttendanceSummary } = useAttendance();
  const today = getTodayString();
  const now = new Date();
  const todayAttendance = getAttendanceForDate(today);

  const todaySummary = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0, unmarked: 0 };
    students.forEach(s => {
      const status = todayAttendance[s.id];
      if (status) counts[status]++;
      else counts.unmarked++;
    });
    return counts;
  }, [students, todayAttendance]);

  const overallSummary = useMemo(() => {
    const month = now.getMonth();
    const year = now.getFullYear();
    if (students.length === 0) return { avg: '0.0', risk: 0 };
    const total = students.reduce((sum, s) => sum + parseFloat(getAttendanceSummary(s.id, month, year).percentage), 0);
    const avg = (total / students.length).toFixed(1);
    const risk = students.filter(s => parseFloat(getAttendanceSummary(s.id, month, year).percentage) < 75).length;
    return { avg, risk };
  }, [students, getAttendanceSummary]);

  const recentDates = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates.slice(-5);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">{formatDate(today)} · {getMonthName(now.getMonth())} {now.getFullYear()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={students.length} color="bg-blue-600" />
        <StatCard icon={CheckCircle} label="Present Today" value={todaySummary.present} sub={`${students.length > 0 ? ((todaySummary.present / students.length) * 100).toFixed(0) : 0}% attendance`} color="bg-green-600" />
        <StatCard icon={TrendingUp} label="Monthly Avg" value={`${overallSummary.avg}%`} sub={getMonthName(now.getMonth())} color="bg-purple-600" />
        <StatCard icon={XCircle} label="At Risk (<75%)" value={overallSummary.risk} sub="This month" color="bg-red-500" />
      </div>

      {/* Today's breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            Today's Attendance
          </h3>
          <div className="space-y-3">
            {[
              { key: 'present', label: 'Present', color: 'bg-green-500' },
              { key: 'absent', label: 'Absent', color: 'bg-red-500' },
              { key: 'leave', label: 'Leave', color: 'bg-yellow-500' },
              { key: 'unmarked', label: 'Not Marked', color: 'bg-gray-300' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600">{label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: students.length > 0 ? `${(todaySummary[key] / students.length) * 100}%` : '0%' }} />
                </div>
                <div className="w-8 text-sm font-medium text-gray-700 text-right">{todaySummary[key]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent attendance trend */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            Recent Attendance Trend
          </h3>
          <div className="space-y-2">
            {recentDates.map(date => {
              const dayAttendance = getAttendanceForDate(date);
              const presentCount = Object.values(dayAttendance).filter(s => s === 'present').length;
              const pct = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(0) : 0;
              return (
                <div key={date} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-500">{formatDate(date).split(' ').slice(0, 2).join(' ')}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-12 text-xs font-medium text-gray-700 text-right">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Students at risk */}
      {overallSummary.risk > 0 && (
        <div className="card border-red-100 bg-red-50">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <XCircle size={18} />
            Students Requiring Attention (Below 75% this month)
          </h3>
          <div className="space-y-2">
            {students
              .filter(s => parseFloat(getAttendanceSummary(s.id, now.getMonth(), now.getFullYear()).percentage) < 75)
              .map(student => {
                const summary = getAttendanceSummary(student.id, now.getMonth(), now.getFullYear());
                return (
                  <div key={student.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.rollNumber} · Class {student.class}{student.section}</p>
                    </div>
                    <Badge variant="absent">{summary.percentage}%</Badge>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
