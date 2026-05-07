'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HistoryIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ClockIcon,
  TrashIcon,
  MessageIcon,
} from '@/components/ui/Icons';
import type { QueryResponse } from '@/types/api';

export interface ConversationItem {
  id: string;
  query: string;
  response: QueryResponse;
  timestamp: Date;
}

interface ConversationHistoryProps {
  items: ConversationItem[];
  onSelectItem: (item: ConversationItem) => void;
  onClearHistory: () => void;
  currentItemId?: string;
}

export default function ConversationHistory({
  items,
  onSelectItem,
  onClearHistory,
  currentItemId,
}: ConversationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) {
    return null;
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors mb-2"
      >
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-4 h-4 text-text-tertiary" />
          <span className="text-sm font-medium text-text-secondary">
            Conversation History
          </span>
          <span className="px-2 py-0.5 rounded-full bg-surface-tertiary text-xs text-text-tertiary">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearHistory();
              }}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-red-500 transition-colors"
              title="Clear history"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-text-tertiary" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-text-tertiary" />
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
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectItem(item)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    currentItemId === item.id
                      ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                      : 'bg-surface-elevated border-border-subtle hover:border-border hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentItemId === item.id
                        ? 'bg-brand-100 dark:bg-brand-900/40'
                        : 'bg-surface-secondary'
                    }`}>
                      <MessageIcon className={`w-4 h-4 ${
                        currentItemId === item.id
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-text-tertiary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.query}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ClockIcon className="w-3 h-3 text-text-tertiary" />
                        <span className="text-xs text-text-tertiary">
                          {formatTime(item.timestamp)}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          • {item.response.sources.length} sources
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
