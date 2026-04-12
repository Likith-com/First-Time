# Student Attendance Portal

A comprehensive frontend application for managing student attendance built with React.js, Vite, and Tailwind CSS.

## Features

### Student Management
- Add new students with details (Name, Roll Number, Email, Phone, Class/Section)
- Edit and delete student records
- Search and filter students by name, roll number, or email
- Sort students by any column
- View monthly attendance percentage per student

### Daily Attendance Tracking
- Mark attendance (Present/Absent/Leave) for each student
- Navigate between dates using prev/next buttons or date picker
- Mark all students at once with bulk actions
- Filter by class or section
- Save attendance records with visual feedback

### Attendance History
- View monthly attendance calendar-style grid
- Color-coded attendance indicators
- Filter by individual student or all students
- Summary stats (Present/Absent/Leave counts and percentage)

### Reports & Analytics
- Monthly attendance summary per student
- Overall statistics (average attendance, high-risk students)
- Progress bars showing attendance levels
- Status badges (Excellent/Good/Average/At Risk)
- Export attendance data to CSV

### Dashboard
- Quick overview stats
- Today's attendance breakdown
- Recent attendance trend (last 5 working days)
- Students requiring attention (below 75% attendance)

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **localStorage** - Data persistence

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### First Run
The app comes with sample data including 5 students and 30 days of simulated attendance data so you can explore all features immediately.

## Project Structure

```
src/
├── components/
│   ├── AttendanceTracking/
│   │   ├── AttendanceMarker.jsx   # Mark daily attendance
│   │   ├── AttendanceHistory.jsx  # View monthly grid
│   │   └── index.js
│   ├── Layout/
│   │   ├── Navbar.jsx             # Top navigation bar
│   │   └── Sidebar.jsx            # Side navigation
│   ├── Reports/
│   │   ├── MonthlyReport.jsx      # Monthly analytics
│   │   └── index.js
│   ├── StudentManagement/
│   │   ├── StudentForm.jsx        # Add/edit student form
│   │   ├── StudentList.jsx        # Students table
│   │   └── index.js
│   └── UI/
│       ├── Badge.jsx              # Status badge
│       ├── Button.jsx             # Reusable button
│       └── Modal.jsx              # Modal dialog
├── context/
│   ├── AttendanceContext.jsx      # Attendance state
│   └── StudentContext.jsx         # Student state
├── hooks/
│   └── useLocalStorage.js         # localStorage hook
├── pages/
│   ├── Attendance.jsx
│   ├── Dashboard.jsx
│   ├── Reports.jsx
│   └── Students.jsx
├── styles/
│   └── index.css                  # Tailwind + custom styles
├── utils/
│   ├── dateUtils.js               # Date helpers
│   ├── exportUtils.js             # CSV export
│   └── sampleData.js              # Sample students & attendance
├── App.jsx
└── main.jsx
```

## Usage

### Adding a Student
1. Go to **Students** page
2. Click **Add Student** button
3. Fill in the required details
4. Click **Add Student** to save

### Marking Attendance
1. Go to **Attendance** page
2. Select the date (defaults to today)
3. Click Present/Absent/Leave for each student
4. Or use **Mark all as** for bulk marking
5. Click **Save Attendance**

### Viewing Reports
1. Go to **Reports** page
2. Select month and year
3. View attendance summary table
4. Click **Export CSV** to download data

## Data Persistence
All data is stored in browser `localStorage`:
- `attendance_students` - Student records
- `attendance_records` - Daily attendance records

To reset all data, clear localStorage in browser developer tools.