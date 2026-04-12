import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Save, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAttendance } from '../../context/AttendanceContext';
import { getTodayString, formatDate } from '../../utils/dateUtils';
import Button from '../UI/Button';
import Badge from '../UI/Badge';

const statusConfig = {
  present: { label: 'Present', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', activeBg: 'bg-green-600 text-white border-green-600' },
  absent: { label: 'Absent', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', activeBg: 'bg-red-600 text-white border-red-600' },
  leave: { label: 'Leave', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', activeBg: 'bg-yellow-600 text-white border-yellow-600' },
};

const AttendanceMarker = () => {
  const { students } = useStudents();
  const { getAttendanceForDate, markBulkAttendance } = useAttendance();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [localAttendance, setLocalAttendance] = useState({});
  const [saved, setSaved] = useState(false);

  const existingAttendance = getAttendanceForDate(selectedDate);

  const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
  const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

  const filteredStudents = useMemo(() => students.filter(s => {
    const matchClass = !filterClass || s.class === filterClass;
    const matchSection = !filterSection || s.section === filterSection;
    return matchClass && matchSection;
  }), [students, filterClass, filterSection]);

  const getStatus = (studentId) => {
    return localAttendance[studentId] ?? existingAttendance[studentId] ?? null;
  };

  const handleMark = (studentId, status) => {
    setLocalAttendance(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const handleMarkAll = (status) => {
    const bulk = {};
    filteredStudents.forEach(s => { bulk[s.id] = status; });
    setLocalAttendance(prev => ({ ...prev, ...bulk }));
    setSaved(false);
  };

  const handleSave = () => {
    const toSave = { ...existingAttendance, ...localAttendance };
    markBulkAttendance(selectedDate, toSave);
    setLocalAttendance({});
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0, unmarked: 0 };
    filteredStudents.forEach(s => {
      const status = getStatus(s.id);
      if (status) counts[status]++;
      else counts.unmarked++;
    });
    return counts;
  }, [filteredStudents, localAttendance, existingAttendance]);

  const navigateDate = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
    setLocalAttendance({});
    setSaved(false);
  };

  const hasChanges = Object.keys(localAttendance).length > 0;

  return (
    <div className="space-y-4">
      {/* Date & Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigateDate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setLocalAttendance({}); setSaved(false); }}
              max={getTodayString()}
              className="input-field w-auto"
            />
            <button onClick={() => navigateDate(1)} disabled={selectedDate >= getTodayString()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50">
              <ChevronRight size={18} />
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">{formatDate(selectedDate)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="input-field w-32">
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="input-field w-32">
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {Object.entries(summary).map(([key, count]) => (
            <div key={key} className={`text-center p-3 rounded-lg ${key === 'present' ? 'bg-green-50' : key === 'absent' ? 'bg-red-50' : key === 'leave' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <div className={`text-xl font-bold ${key === 'present' ? 'text-green-700' : key === 'absent' ? 'text-red-700' : key === 'leave' ? 'text-yellow-700' : 'text-gray-600'}`}>{count}</div>
              <div className="text-xs text-gray-500 capitalize">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-500">Mark all as:</span>
        {Object.entries(statusConfig).map(([status, config]) => (
          <Button key={status} variant="secondary" size="sm" onClick={() => handleMarkAll(status)}>
            <config.icon size={14} className={config.color} />
            {config.label}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {saved && <span className="text-sm text-green-600 font-medium">✓ Saved!</span>}
          <Button onClick={handleSave} variant="primary" disabled={!hasChanges && !saved}>
            <Save size={16} />
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Student Rows */}
      <div className="space-y-2">
        {filteredStudents.length === 0 ? (
          <div className="card text-center text-gray-500 text-sm py-8">
            No students found for the selected filters.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const status = getStatus(student.id);
            return (
              <div key={student.id} className="card py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.rollNumber} · Class {student.class}{student.section}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {Object.entries(statusConfig).map(([s, config]) => (
                    <button
                      key={s}
                      onClick={() => handleMark(student.id, s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${status === s ? config.activeBg : config.bg + ' ' + config.color + ' hover:opacity-80'}`}
                    >
                      <config.icon size={13} />
                      <span className="hidden sm:inline">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceMarker;
