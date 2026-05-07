'use client';

import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ZapIcon, 
  LayersIcon, 
  TargetIcon,
  TrendingUpIcon,
} from '@/components/ui/Icons';

interface MetricItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'brand' | 'emerald' | 'amber' | 'violet';
  trend?: 'up' | 'down' | 'neutral';
}

interface MetricsMiniCardProps {
  retrievalTime: number;
  generationTime: number;
  confidence: number | null;
  chunksRetrieved: number;
}

export default function MetricsMiniCard({
  retrievalTime,
  generationTime,
  confidence,
  chunksRetrieved,
}: MetricsMiniCardProps) {
  const totalTime = retrievalTime + generationTime;

  const metrics: MetricItem[] = [
    {
      label: 'Retrieval',
      value: `${retrievalTime.toFixed(0)}ms`,
      icon: <ClockIcon className="w-3.5 h-3.5" />,
      color: 'brand',
    },
    {
      label: 'Generation',
      value: `${generationTime.toFixed(0)}ms`,
      icon: <ZapIcon className="w-3.5 h-3.5" />,
      color: 'violet',
    },
    {
      label: 'Total',
      value: `${totalTime.toFixed(0)}ms`,
      icon: <TrendingUpIcon className="w-3.5 h-3.5" />,
      color: 'emerald',
    },
    {
      label: 'Sources',
      value: chunksRetrieved,
      icon: <LayersIcon className="w-3.5 h-3.5" />,
      color: 'amber',
    },
  ];

  const colorClasses = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="p-3 rounded-xl bg-surface-secondary/50 dark:bg-surface-tertiary/50 border border-border-subtle"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1.5 rounded-lg ${colorClasses[metric.color]}`}>
              {metric.icon}
            </div>
            <span className="text-xs text-text-tertiary">{metric.label}</span>
          </div>
          <p className="text-lg font-semibold text-text-primary pl-0.5">
            {metric.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
