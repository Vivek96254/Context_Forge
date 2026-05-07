'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

interface QueryRewriteCardProps {
  originalQuery: string;
  rewrittenQuery: string | null;
  defaultExpanded?: boolean;
}

export default function QueryRewriteCard({ 
  originalQuery, 
  rewrittenQuery,
  defaultExpanded = false 
}: QueryRewriteCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!rewrittenQuery || rewrittenQuery === originalQuery) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-brand-100/50 dark:hover:bg-brand-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
            AI Optimized Query
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-600 dark:text-brand-400 opacity-70">
            Click to {isExpanded ? 'collapse' : 'expand'}
          </span>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Original Query */}
              <div className="p-3 rounded-lg bg-white/60 dark:bg-surface-primary/40 border border-border-subtle">
                <p className="text-xs font-medium text-text-tertiary mb-1">Original Query</p>
                <p className="text-sm text-text-secondary">{originalQuery}</p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRightIcon className="w-4 h-4 text-brand-500 rotate-90" />
              </div>

              {/* Rewritten Query */}
              <div className="p-3 rounded-lg bg-white/80 dark:bg-surface-primary/60 border border-brand-200 dark:border-brand-800">
                <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mb-1">
                  Enhanced Query
                </p>
                <p className="text-sm text-text-primary font-medium">{rewrittenQuery}</p>
              </div>

              {/* Explanation */}
              <p className="text-xs text-text-tertiary text-center">
                Your query was automatically enhanced for better search results
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
