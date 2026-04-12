import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { sampleStudents } from '../utils/sampleData';

const StudentContext = createContext(null);

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useLocalStorage('attendance_students', sampleStudents);

  const addStudent = useCallback((studentData) => {
    const newStudent = {
      ...studentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudents(prev => [...prev, newStudent]);
    return newStudent;
  }, [setStudents]);

  const updateStudent = useCallback((id, studentData) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
  }, [setStudents]);

  const deleteStudent = useCallback((id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, [setStudents]);

  const getStudent = useCallback((id) => {
    return students.find(s => s.id === id);
  }, [students]);

  return (
    <StudentContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, getStudent }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudents must be used within StudentProvider');
  return context;
};
