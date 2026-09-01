import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'yellow' | 'emerald' | 'amber' | 'red' | 'blue';
  onClick?: () => void;
  isActive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'yellow',
  onClick,
  isActive = false,
}) => {
  const getBorderColor = () => {
    switch (accentColor) {
      case 'yellow': return 'border-l-[#ffcd00]';
      case 'emerald': return 'border-l-emerald-500';
      case 'amber': return 'border-l-amber-500';
      case 'red': return 'border-l-red-500';
      case 'blue': return 'border-l-blue-500';
      default: return 'border-l-[#ffcd00]';
    }
  };

  const getIconColor = () => {
    switch (accentColor) {
      case 'yellow': return 'text-[#ffcd00]';
      case 'emerald': return 'text-emerald-400';
      case 'amber': return 'text-amber-400';
      case 'red': return 'text-red-400';
      case 'blue': return 'text-blue-400';
      default: return 'text-[#ffcd00]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#1d1f20] border border-[#2e3132] border-l-4 ${getBorderColor()} rounded-md p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-[#232627] hover:border-gray-500' : ''
      } ${isActive ? 'ring-2 ring-[#ffcd00] bg-[#242728]' : ''} shadow-md`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
          {title}
        </span>
        <div className={`p-2 rounded bg-[#161718] border border-[#2c2f30] ${getIconColor()}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono text-white tracking-tight">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-mono font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-400 font-sans truncate">{subtitle}</p>
      )}
    </div>
  );
};
