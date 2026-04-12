import React, { useState } from 'react';
import { AttendanceMarker, AttendanceHistory } from '../components/AttendanceTracking';

const Attendance = () => {
  const [tab, setTab] = useState('mark');
  
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Attendance Tracking</h2>
        <p className="text-sm text-gray-500 mt-0.5">Mark and view attendance records</p>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { key: 'mark', label: 'Mark Attendance' },
            { key: 'history', label: 'Attendance History' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
      
      {tab === 'mark' ? <AttendanceMarker /> : <AttendanceHistory />}
    </div>
  );
};

export default Attendance;
