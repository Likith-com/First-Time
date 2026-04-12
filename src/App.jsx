import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentProvider } from './context/StudentContext';
import { AttendanceProvider } from './context/AttendanceContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <StudentProvider>
      <AttendanceProvider>
        <div className={darkMode ? 'dark' : ''}>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar
              darkMode={darkMode}
              toggleDarkMode={() => setDarkMode(d => !d)}
              toggleSidebar={() => setSidebarOpen(o => !o)}
            />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <main className="flex-1 overflow-auto p-4 lg:p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </main>
            </div>
          </div>
        </div>
      </AttendanceProvider>
    </StudentProvider>
  );
};

export default App;
