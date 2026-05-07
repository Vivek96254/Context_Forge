'use client';

import { motion } from 'framer-motion';
import { 
  SearchIcon, 
  SparklesIcon, 
  AlertIcon,
  FileIcon,
  MessageIcon,
} from '@/components/ui/Icons';

interface EmptyStateProps {
  variant: 'no-query' | 'no-results' | 'error' | 'no-documents';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  variant, 
  title,
  description,
  action,
}: EmptyStateProps) {
  const variants = {
    'no-query': {
      icon: MessageIcon,
      defaultTitle: 'Ask anything about your documents',
      defaultDescription: 'Start by asking a question. Our AI will search through your knowledge base and provide relevant answers with citations.',
      gradient: 'from-brand-500 to-violet-500',
    },
    'no-results': {
      icon: SearchIcon,
      defaultTitle: 'No results found',
      defaultDescription: 'We couldn\'t find any relevant information for your query. Try rephrasing your question or uploading more documents.',
      gradient: 'from-amber-500 to-orange-500',
    },
    'error': {
      icon: AlertIcon,
      defaultTitle: 'Something went wrong',
      defaultDescription: 'We encountered an error while processing your request. Please try again.',
      gradient: 'from-red-500 to-rose-500',
    },
    'no-documents': {
      icon: FileIcon,
      defaultTitle: 'No documents uploaded',
      defaultDescription: 'Upload some documents to get started. Our AI will index them and make them searchable.',
      gradient: 'from-emerald-500 to-teal-500',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon Container */}
      <div className="relative mb-6">
        {/* Background Glow */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-20 blur-2xl scale-150`} />
        
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-secondary max-w-md mb-6">
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </motion.button>
      )}

      {/* Suggestions for no-query */}
      {variant === 'no-query' && (
        <div className="mt-8 w-full max-w-lg">
          <p className="text-xs text-text-tertiary mb-4">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'What are the key features?',
              'How does authentication work?',
              'Explain the architecture',
              'What are the limitations?',
            ].map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-2 p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-tertiary border border-border-subtle text-left text-sm text-text-secondary hover:text-text-primary transition-all group"
              >
                <SparklesIcon className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="truncate">{suggestion}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
          <AlertIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
            Query Failed
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
