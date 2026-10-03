import React from 'react';
import { AppointmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus | 'verified' | 'unverified' | 'featured' | 'approved' | 'pending_approval';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'confirmed':
      return (
        <span className={`inline-flex items-center font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-600 rounded-full"></span>
          Confirmed
        </span>
      );
    case 'pending':
    case 'pending_approval':
      return (
        <span className={`inline-flex items-center font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-amber-600 rounded-full"></span>
          Pending
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center font-medium bg-sky-50 text-sky-800 border border-sky-200 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-sky-600 rounded-full"></span>
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center font-medium bg-slate-100 text-slate-700 border border-slate-300 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-slate-500 rounded-full"></span>
          Cancelled
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium bg-rose-50 text-rose-800 border border-rose-200 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-rose-600 rounded-full"></span>
          Rejected
        </span>
      );
    case 'verified':
    case 'approved':
      return (
        <span className={`inline-flex items-center font-medium bg-blue-50 text-blue-800 border border-blue-200 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-blue-600 rounded-full"></span>
          Verified
        </span>
      );
    case 'unverified':
      return (
        <span className={`inline-flex items-center font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full"></span>
          Unverified
        </span>
      );
    case 'featured':
      return (
        <span className={`inline-flex items-center font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 rounded ${sizeClasses}`}>
          Featured
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium bg-slate-100 text-slate-700 border border-slate-300 rounded ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
