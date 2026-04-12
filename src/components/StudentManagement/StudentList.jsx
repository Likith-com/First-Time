import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAttendance } from '../../context/AttendanceContext';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import StudentForm from './StudentForm';

const StudentList = () => {
  const { students, deleteStudent } = useStudents();
  const { getAttendanceSummary } = useAttendance();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const classes = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
  const sections = useMemo(() => [...new Set(students.map(s => s.section))].sort(), [students]);

  const filtered = useMemo(() => {
    let list = students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchClass = !filterClass || s.class === filterClass;
      const matchSection = !filterSection || s.section === filterSection;
      return matchSearch && matchClass && matchSection;
    });

    list = [...list].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [students, search, filterClass, filterSection, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, roll no, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="input-field w-32">
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="input-field w-32">
            <option value="">All Sections</option>
            {sections.map(s => <option key={s} value={s}>Sec {s}</option>)}
          </select>
          <Button onClick={() => setIsAddOpen(true)} variant="primary">
            <Plus size={16} />
            <span className="hidden sm:inline">Add Student</span>
          </Button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'rollNumber', label: 'Roll No' },
                { key: 'name', label: 'Name' },
                { key: 'class', label: 'Class' },
                { key: 'section', label: 'Section' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                >
                  <span className="flex items-center gap-1">
                    {col.label} <SortIcon field={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                  No students found. {search || filterClass || filterSection ? 'Try adjusting your filters.' : 'Add a student to get started.'}
                </td>
              </tr>
            ) : (
              filtered.map(student => {
                const summary = getAttendanceSummary(student.id, currentMonth, currentYear);
                const pct = parseFloat(summary.percentage);
                const badgeVariant = pct >= 75 ? 'present' : pct >= 50 ? 'leave' : 'absent';
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.rollNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">{student.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.phone}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={badgeVariant}>{summary.percentage}%</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditStudent(student)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit student"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(student)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Student">
        <StudentForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
        <StudentForm student={editStudent} onSuccess={() => setEditStudent(null)} onCancel={() => setEditStudent(null)} />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Student" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.rollNumber})? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => { deleteStudent(deleteConfirm.id); setDeleteConfirm(null); }}>
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentList;
