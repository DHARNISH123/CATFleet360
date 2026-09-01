import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status?.toUpperCase()) {
      case 'OPERATIONAL':
      case 'IN_OPERATION':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'AVAILABLE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ASSIGNED':
      case 'ON_DUTY':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'UNDER_MAINTENANCE':
      case 'IN_PROGRESS':
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'ON_RENT':
      case 'RENTAL':
      case 'ACTIVE':
        return 'bg-amber-500/10 text-[#ffcd00] border-amber-500/30';
      case 'IDLE':
      case 'SCHEDULED':
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'REPORTED':
      case 'INSPECTION_REQUIRED':
      case 'LOW':
        return 'bg-gray-500/10 text-gray-300 border-gray-500/30';
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'RETIRED':
      case 'CANCELLED':
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const formattedText = status?.replace(/_/g, ' ') || 'UNKNOWN';

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-sm border ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
      } ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {formattedText}
    </span>
  );
};
