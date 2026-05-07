'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon, CopyIcon, CheckIcon } from '@/components/ui/Icons';

interface ExpandableSnippetProps {
  content: string;
  maxLength?: number;
  className?: string;
}

export default function ExpandableSnippet({ 
  content, 
  maxLength = 200,
  className = '' 
}: ExpandableSnippetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const shouldTruncate = content.length > maxLength;
  const displayContent = isExpanded || !shouldTruncate 
    ? content 
    : content.substring(0, maxLength) + '...';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <motion.div
        layout
        className="p-3 bg-surface-secondary/50 dark:bg-surface-tertiary/50 rounded-lg border border-border-subtle"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap"
          >
            {displayContent}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-subtle">
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                  Show more
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
