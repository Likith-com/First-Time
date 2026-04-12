import React from 'react';
import { MonthlyReport } from '../components/Reports';

const Reports = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Monthly attendance reports and analytics</p>
      </div>
      <MonthlyReport />
    </div>
  );
};

export default Reports;
