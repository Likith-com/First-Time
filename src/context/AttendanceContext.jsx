import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleStudents, generateSampleAttendance } from '../utils/sampleData';
import { getTodayString } from '../utils/dateUtils';

const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const [attendance, setAttendance] = useLocalStorage(
    'attendance_records',
    generateSampleAttendance(sampleStudents)
  );

  const markAttendance = useCallback((date, studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [studentId]: status,
      },
    }));
  }, [setAttendance]);

  const markBulkAttendance = useCallback((date, records) => {
    setAttendance(prev => ({
      ...prev,
      [date]: { ...(prev[date] || {}), ...records },
    }));
  }, [setAttendance]);

  const getAttendanceForDate = useCallback((date) => {
    return attendance[date] || {};
  }, [attendance]);

  const getStudentAttendance = useCallback((studentId) => {
    const result = {};
    Object.entries(attendance).forEach(([date, records]) => {
      if (records[studentId]) {
        result[date] = records[studentId];
      }
    });
    return result;
  }, [attendance]);

  const getAttendanceSummary = useCallback((studentId, month, year) => {
    let present = 0, absent = 0, leave = 0, total = 0;
    Object.entries(attendance).forEach(([date, records]) => {
      const d = new Date(date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const status = records[studentId];
        if (status) {
          total++;
          if (status === 'present') present++;
          else if (status === 'absent') absent++;
          else if (status === 'leave') leave++;
        }
      }
    });
    return { present, absent, leave, total, percentage: total > 0 ? ((present / total) * 100).toFixed(1) : '0.0' };
  }, [attendance]);

  const getDateAttendanceSummary = useCallback((date) => {
    const records = attendance[date] || {};
    const counts = { present: 0, absent: 0, leave: 0, unmarked: 0 };
    Object.values(records).forEach(status => {
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [attendance]);

  return (
    <AttendanceContext.Provider value={{
      attendance,
      markAttendance,
      markBulkAttendance,
      getAttendanceForDate,
      getStudentAttendance,
      getAttendanceSummary,
      getDateAttendanceSummary,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error('useAttendance must be used within AttendanceProvider');
  return context;
};
