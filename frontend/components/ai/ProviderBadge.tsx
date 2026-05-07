'use client';

import { motion } from 'framer-motion';
import { OpenAIIcon, CerebrasIcon, BrainIcon } from '@/components/ui/Icons';

interface ProviderBadgeProps {
  provider?: string;
  model?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProviderBadge({ 
  provider = 'openai',
  model,
  size = 'md' 
}: ProviderBadgeProps) {
  const normalizedProvider = provider?.toLowerCase() || 'openai';

  const providerConfig = {
    openai: {
      name: 'OpenAI',
      icon: OpenAIIcon,
      gradient: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    cerebras: {
      name: 'Cerebras',
      icon: CerebrasIcon,
      gradient: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      textColor: 'text-violet-700 dark:text-violet-300',
      borderColor: 'border-violet-200 dark:border-violet-800',
    },
    default: {
      name: 'AI',
      icon: BrainIcon,
      gradient: 'from-brand-500 to-brand-600',
      bgColor: 'bg-brand-50 dark:bg-brand-900/20',
      textColor: 'text-brand-700 dark:text-brand-300',
      borderColor: 'border-brand-200 dark:border-brand-800',
    },
  };

  const config = providerConfig[normalizedProvider as keyof typeof providerConfig] || providerConfig.default;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.name}</span>
      {model && size !== 'sm' && (
        <span className="opacity-60 text-2xs hidden sm:inline">• {model}</span>
      )}
    </motion.div>
  );
}
