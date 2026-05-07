'use client';

import { motion } from 'framer-motion';
import { ShieldIcon, AlertIcon, CheckIcon } from '@/components/ui/Icons';

interface ConfidenceBadgeProps {
  confidence: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ConfidenceBadge({ 
  confidence, 
  size = 'md',
  showLabel = true 
}: ConfidenceBadgeProps) {
  if (confidence === null) {
    return (
      <div className="badge-neutral">
        <ShieldIcon className="w-3 h-3 mr-1" />
        N/A
      </div>
    );
  }

  const percentage = confidence * 100;
  
  const getConfidenceLevel = () => {
    if (percentage >= 80) return { level: 'high', color: 'emerald', label: 'High Confidence' };
    if (percentage >= 60) return { level: 'medium', color: 'amber', label: 'Medium Confidence' };
    return { level: 'low', color: 'red', label: 'Low Confidence' };
  };

  const { level, color, label } = getConfidenceLevel();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  const Icon = level === 'high' ? CheckIcon : level === 'medium' ? ShieldIcon : AlertIcon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{percentage.toFixed(0)}%</span>
      {showLabel && size !== 'sm' && (
        <span className="opacity-70 hidden sm:inline">• {label}</span>
      )}
    </motion.div>
  );
}
