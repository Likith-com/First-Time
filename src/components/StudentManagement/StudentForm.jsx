import React, { useState, useEffect } from 'react';
import { useStudents } from '../../context/StudentContext';
import Button from '../UI/Button';

const initialForm = {
  name: '',
  rollNumber: '',
  email: '',
  phone: '',
  class: '',
  section: '',
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  
  if (!form.rollNumber.trim()) errors.rollNumber = 'Roll number is required';
  
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address';
  
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!/^[0-9]{10}$/.test(form.phone.trim())) errors.phone = 'Phone must be 10 digits';
  
  if (!form.class.trim()) errors.class = 'Class is required';
  if (!form.section.trim()) errors.section = 'Section is required';
  
  return errors;
};

const StudentForm = ({ student, onSuccess, onCancel }) => {
  const { addStudent, updateStudent, students } = useStudents();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || '',
        rollNumber: student.rollNumber || '',
        email: student.email || '',
        phone: student.phone || '',
        class: student.class || '',
        section: student.section || '',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check for duplicate roll number
    const isDuplicate = students.some(s => 
      s.rollNumber.toLowerCase() === form.rollNumber.toLowerCase() && 
      s.id !== student?.id
    );
    if (isDuplicate) {
      setErrors(prev => ({ ...prev, rollNumber: 'Roll number already exists' }));
      return;
    }

    if (student) {
      updateStudent(student.id, form);
    } else {
      addStudent(form);
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{submitError}</div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter student name"
            className={`input-field ${errors.name ? 'border-red-400' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
          <input
            type="text"
            name="rollNumber"
            value={form.rollNumber}
            onChange={handleChange}
            placeholder="e.g. CS001"
            className={`input-field ${errors.rollNumber ? 'border-red-400' : ''}`}
          />
          {errors.rollNumber && <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="student@school.edu"
            className={`input-field ${errors.email ? 'border-red-400' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit number"
            className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <select
            name="class"
            value={form.class}
            onChange={handleChange}
            className={`input-field ${errors.class ? 'border-red-400' : ''}`}
          >
            <option value="">Select Class</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
            ))}
          </select>
          {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
          <select
            name="section"
            value={form.section}
            onChange={handleChange}
            className={`input-field ${errors.section ? 'border-red-400' : ''}`}
          >
            <option value="">Select Section</option>
            {['A', 'B', 'C', 'D', 'E'].map(s => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
          {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
        </div>
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          {student ? 'Update Student' : 'Add Student'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
