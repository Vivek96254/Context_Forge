'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SendIcon, 
  SparklesIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@/components/ui/Icons';

interface PremiumQueryInputProps {
  onSubmit: (query: string, topK: number) => void;
  isLoading?: boolean;
  placeholder?: string;
  defaultTopK?: number;
}

export default function PremiumQueryInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Ask anything about your documents...',
  defaultTopK = 5,
}: PremiumQueryInputProps) {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(defaultTopK);
  const [showSettings, setShowSettings] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;
    onSubmit(query.trim(), topK);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <motion.div
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 2px rgba(90, 106, 255, 0.2), 0 4px 20px rgba(90, 106, 255, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
        className={`
          relative overflow-hidden rounded-2xl border transition-colors duration-200
          ${isFocused 
            ? 'border-brand-500 bg-surface-elevated' 
            : 'border-border bg-surface-secondary hover:border-border-strong'
          }
        `}
      >
        {/* Gradient Border Accent */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-500 via-violet-500 to-brand-500"
            />
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* AI Icon */}
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
              ${isFocused 
                ? 'bg-gradient-to-br from-brand-500 to-violet-500' 
                : 'bg-surface-tertiary'
              }
            `}>
              <SparklesIcon className={`w-4 h-4 ${isFocused ? 'text-white' : 'text-text-tertiary'}`} />
            </div>

            {/* Textarea */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={isLoading}
                rows={1}
                className="w-full bg-transparent text-text-primary placeholder:text-text-tertiary text-sm leading-relaxed resize-none focus:outline-none disabled:opacity-50"
                style={{ minHeight: '24px' }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex items-center justify-between">
          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${showSettings 
                ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' 
                : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-tertiary'
              }
            `}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Options</span>
            {showSettings ? (
              <ChevronUpIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}
          </button>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit()}
            disabled={!query.trim() || isLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all
              ${query.trim() && !isLoading
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40'
                : 'bg-surface-tertiary text-text-tertiary cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                <span>Ask</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border-subtle"
            >
              <div className="p-4 bg-surface-secondary/50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-text-primary">
                      Number of Sources
                    </label>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      Retrieve top {topK} most relevant chunks
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={topK}
                      onChange={(e) => setTopK(parseInt(e.target.value))}
                      className="w-24 h-1.5 bg-surface-tertiary rounded-full appearance-none cursor-pointer accent-brand-500"
                    />
                    <span className="w-6 text-center text-sm font-semibold text-text-primary">
                      {topK}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Keyboard Hint */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <span className="text-xs text-text-tertiary">
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-2xs">Enter</kbd> to send
        </span>
        <span className="text-xs text-text-tertiary">
          <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-2xs">Shift + Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
}
