import React from 'react';

const variants = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  leave: 'bg-yellow-100 text-yellow-800',
  unmarked: 'bg-gray-100 text-gray-600',
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

const Badge = ({ variant = 'info', children, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
