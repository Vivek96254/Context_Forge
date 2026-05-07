'use client';

import { motion } from 'framer-motion';
import { SparklesIcon, BrainIcon, SearchIcon, ZapIcon } from '@/components/ui/Icons';

interface LoadingStateProps {
  variant?: 'default' | 'searching' | 'thinking' | 'generating';
  message?: string;
}

export function LoadingState({ variant = 'default', message }: LoadingStateProps) {
  const variants = {
    default: {
      icon: SparklesIcon,
      defaultMessage: 'Processing your request...',
      color: 'brand',
    },
    searching: {
      icon: SearchIcon,
      defaultMessage: 'Searching knowledge base...',
      color: 'violet',
    },
    thinking: {
      icon: BrainIcon,
      defaultMessage: 'Analyzing context...',
      color: 'amber',
    },
    generating: {
      icon: ZapIcon,
      defaultMessage: 'Generating response...',
      color: 'emerald',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  const colorClasses = {
    brand: 'from-brand-500 to-violet-500',
    violet: 'from-violet-500 to-purple-500',
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-teal-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        {/* Glow Effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]} blur-xl`}
        />
        
        {/* Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClasses[config.color as keyof typeof colorClasses]} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
      </div>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-base font-medium text-text-primary mb-2"
      >
        {message || config.defaultMessage}
      </motion.p>

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[config.color as keyof typeof colorClasses]}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      <span className="text-sm text-text-secondary">AI is typing</span>
      <div className="typing-indicator">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-surface-elevated animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl skeleton" />
        <div className="flex-1">
          <div className="h-4 w-32 skeleton rounded mb-2" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 skeleton rounded w-full" />
        <div className="h-4 skeleton rounded w-5/6" />
        <div className="h-4 skeleton rounded w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = 'full' }: { width?: 'full' | '3/4' | '1/2' | '1/4' }) {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  return <div className={`h-4 skeleton rounded ${widthClasses[width]}`} />;
}

export function PulseIndicator({ color = 'brand' }: { color?: 'brand' | 'emerald' | 'amber' | 'red' }) {
  const colorClasses = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClasses[color]}`} />
    </span>
  );
}
