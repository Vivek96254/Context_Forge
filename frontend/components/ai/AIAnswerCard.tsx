'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  CopyIcon, 
  CheckIcon,
  BookmarkIcon,
  ShareIcon,
  RefreshIcon,
} from '@/components/ui/Icons';
import MarkdownRenderer from './MarkdownRenderer';
import ConfidenceBadge from './ConfidenceBadge';
import ProviderBadge from './ProviderBadge';
import type { QueryResponse } from '@/types/api';

interface AIAnswerCardProps {
  response: QueryResponse;
  isStreaming?: boolean;
  onCitationClick?: (index: number) => void;
  onRetry?: () => void;
}

export default function AIAnswerCard({ 
  response, 
  isStreaming = false,
  onCitationClick,
  onRetry,
}: AIAnswerCardProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const answerWithCitations = useMemo(() => {
    let processedAnswer = response.answer;
    
    response.sources.forEach((_, index) => {
      const citationPattern = new RegExp(`\\[${index + 1}\\]`, 'g');
      processedAnswer = processedAnswer.replace(
        citationPattern,
        `<sup class="citation-ref" data-citation="${index}">[${index + 1}]</sup>`
      );
    });
    
    return processedAnswer;
  }, [response.answer, response.sources]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden"
    >
      {/* Main Card */}
      <div className="card-premium p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* AI Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              {isStreaming && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface-elevated animate-pulse" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary">
                  AI Assistant
                </h3>
                <ProviderBadge provider="openai" size="sm" />
              </div>
              <p className="text-xs text-text-tertiary">
                {isStreaming ? 'Generating response...' : 'Response complete'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ConfidenceBadge confidence={response.confidence} size="sm" showLabel={false} />
            
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors group"
              title="Copy response"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-emerald-500" />
              ) : (
                <CopyIcon className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary" />
              )}
            </button>
            
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors group"
              title="Bookmark"
            >
              <BookmarkIcon 
                className={`w-4 h-4 ${bookmarked ? 'text-amber-500 fill-amber-500' : 'text-text-tertiary group-hover:text-text-secondary'}`} 
              />
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors group"
                title="Retry"
              >
                <RefreshIcon className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary" />
              </button>
            )}
          </div>
        </div>

        {/* Answer Content */}
        <div className="relative">
          {isStreaming && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'linear' }}
              className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-brand-500 to-violet-500"
            />
          )}
          
          <div 
            className="answer-content"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.classList.contains('citation-ref')) {
                const citationIndex = parseInt(target.dataset.citation || '0');
                onCitationClick?.(citationIndex);
              }
            }}
          >
            <MarkdownRenderer content={answerWithCitations} />
          </div>
        </div>

        {/* Source References */}
        {response.sources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-tertiary mb-3">
              Based on {response.sources.length} source{response.sources.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {response.sources.slice(0, 5).map((source, index) => (
                <button
                  key={`${source.document_id}-${source.chunk_index}`}
                  onClick={() => onCitationClick?.(index)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle text-xs font-medium text-text-secondary transition-colors group"
                >
                  <span className="w-4 h-4 rounded bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-2xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="truncate max-w-[120px]">{source.filename}</span>
                </button>
              ))}
              {response.sources.length > 5 && (
                <span className="inline-flex items-center px-2.5 py-1.5 text-xs text-text-tertiary">
                  +{response.sources.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Citation Reference Styles */}
      <style jsx global>{`
        .citation-ref {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1rem;
          height: 1rem;
          padding: 0 0.25rem;
          margin: 0 0.125rem;
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--accent-primary);
          background: var(--surface-secondary);
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.15s ease;
          vertical-align: super;
        }
        
        .citation-ref:hover {
          background: var(--accent-primary);
          color: white;
          transform: scale(1.1);
        }
      `}</style>
    </motion.div>
  );
}
