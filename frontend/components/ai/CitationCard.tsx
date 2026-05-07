'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  ExternalLinkIcon,
  HashIcon,
  TargetIcon,
} from '@/components/ui/Icons';
import ExpandableSnippet from './ExpandableSnippet';
import type { SourceReference } from '@/types/api';

interface CitationCardProps {
  source: SourceReference;
  index: number;
  isHighlighted?: boolean;
  onHover?: (index: number | null) => void;
}

export default function CitationCard({ 
  source, 
  index,
  isHighlighted = false,
  onHover,
}: CitationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const scorePercentage = (source.score * 100).toFixed(1);
  const scoreColor = source.score >= 0.8 
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
    : source.score >= 0.6 
    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
      className={`
        relative overflow-hidden rounded-xl border transition-all duration-200
        ${isHighlighted 
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 shadow-glow' 
          : 'border-border-subtle bg-surface-elevated hover:border-border hover:shadow-premium-md'
        }
      `}
    >
      {/* Citation Number Badge */}
      <div className="absolute top-3 left-3 w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold">
        {index + 1}
      </div>

      {/* Header */}
      <div 
        className="p-4 pl-12 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileIcon className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-text-primary truncate">
                {source.filename}
              </h4>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <HashIcon className="w-3 h-3" />
                Chunk {source.chunk_index}
              </span>
              <span className="flex items-center gap-1">
                ID: {source.document_id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Relevance Score */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
              <TargetIcon className="w-3 h-3" />
              {scorePercentage}%
            </div>

            {/* Expand Button */}
            <button className="p-1 rounded-lg hover:bg-surface-tertiary transition-colors">
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-text-tertiary" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-text-tertiary" />
              )}
            </button>
          </div>
        </div>

        {/* Preview (always visible) */}
        {!isExpanded && (
          <p className="mt-2 text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {source.content.substring(0, 150)}...
          </p>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <ExpandableSnippet content={source.content} maxLength={500} />
              
              {/* Quick Actions */}
              <div className="flex items-center justify-end gap-2 mt-3">
                <button className="flex items-center gap-1 text-xs text-text-tertiary hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  <ExternalLinkIcon className="w-3 h-3" />
                  View Document
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Highlight Indicator */}
      {isHighlighted && (
        <motion.div
          layoutId="citation-highlight"
          className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"
        />
      )}
    </motion.div>
  );
}
