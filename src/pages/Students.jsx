import React from 'react';
import { StudentList } from '../components/StudentManagement';

const Students = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Student Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">Add, edit, and manage student records</p>
      </div>
      <StudentList />
    </div>
  );
};

export default Students;
