'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AIAnswerCard,
  ConversationHistory,
  EmptyState,
  ErrorState,
  LoadingState,
  MetricsMiniCard,
  PremiumQueryInput,
  QueryRewriteCard,
  SourcePanel,
  type ConversationItem,
} from '@/components/ai';
import { 
  PanelRightIcon,
  ChevronRightIcon,
  ActivityIcon,
  LayersIcon,
  SparklesIcon,
} from '@/components/ui/Icons';
import { useQuery } from '@/hooks/useQuery';
import type { QueryResponse } from '@/types/api';

export default function QueryPage() {
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const { query: executeQuery, loading, error, reset } = useQuery();

  useEffect(() => {
    const saved = localStorage.getItem('conversation-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversationHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      } catch (e) {
        console.error('Failed to parse conversation history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (conversationHistory.length > 0) {
      localStorage.setItem('conversation-history', JSON.stringify(conversationHistory));
    }
  }, [conversationHistory]);

  const handleSubmit = useCallback(async (queryText: string, topK: number) => {
    try {
      const result = await executeQuery({ query: queryText, top_k: topK });
      setResponse(result);
      
      const newItem: ConversationItem = {
        id: Date.now().toString(),
        query: queryText,
        response: result,
        timestamp: new Date(),
      };
      
      setConversationHistory(prev => [newItem, ...prev].slice(0, 20));
      setCurrentConversationId(newItem.id);
    } catch (err) {
      console.error('Query failed:', err);
    }
  }, [executeQuery]);

  const handleSelectHistoryItem = useCallback((item: ConversationItem) => {
    setResponse(item.response);
    setCurrentConversationId(item.id);
  }, []);

  const handleClearHistory = useCallback(() => {
    setConversationHistory([]);
    localStorage.removeItem('conversation-history');
    setCurrentConversationId(null);
  }, []);

  const handleCitationClick = useCallback((index: number) => {
    setHighlightedCitation(index);
    setIsPanelCollapsed(false);
    setTimeout(() => setHighlightedCitation(null), 2000);
  }, []);

  const handleRetry = useCallback(() => {
    if (response) {
      handleSubmit(response.query, 5);
    }
  }, [response, handleSubmit]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isPanelCollapsed ? 'pr-0' : 'lg:pr-96'}`}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 mb-4 shadow-lg shadow-brand-500/25">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Enterprise Knowledge Assistant
            </h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Ask questions about your documents and get AI-powered answers with citations
            </p>
          </motion.div>

          {/* Conversation History */}
          <ConversationHistory
            items={conversationHistory}
            onSelectItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            currentItemId={currentConversationId ?? undefined}
          />

          {/* Query Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <PremiumQueryInput
              onSubmit={handleSubmit}
              isLoading={loading}
              placeholder="Ask anything about your documents..."
            />
          </motion.div>

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingState variant="searching" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence mode="wait">
            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState error={error} onRetry={handleRetry} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Response */}
          <AnimatePresence mode="wait">
            {response && !loading && !error && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Query Rewrite */}
                {response.rewritten_query && response.rewritten_query !== response.query && (
                  <QueryRewriteCard
                    originalQuery={response.query}
                    rewrittenQuery={response.rewritten_query}
                  />
                )}

                {/* AI Answer */}
                <AIAnswerCard
                  response={response}
                  onCitationClick={handleCitationClick}
                  onRetry={handleRetry}
                />

                {/* Mobile Sources (visible on mobile only) */}
                <div className="lg:hidden">
                  <SourcePanel
                    sources={response.sources}
                    highlightedCitation={highlightedCitation}
                    onCitationHover={setHighlightedCitation}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!response && !loading && !error && (
            <EmptyState variant="no-query" />
          )}
        </div>
      </div>

      {/* Right Side Panel (Desktop) */}
      <AnimatePresence>
        {!isPanelCollapsed && (
          <motion.aside
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden lg:block fixed right-0 top-16 bottom-0 w-96 border-l border-border bg-surface-secondary/30 backdrop-blur-xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Panel Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-primary">
                  Response Details
                </h2>
                <button
                  onClick={() => setIsPanelCollapsed(true)}
                  className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                  title="Collapse panel"
                >
                  <PanelRightIcon className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>

              {response ? (
                <>
                  {/* Metrics */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ActivityIcon className="w-4 h-4 text-text-tertiary" />
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Performance Metrics
                      </h3>
                    </div>
                    <MetricsMiniCard
                      retrievalTime={response.retrieval_time_ms}
                      generationTime={response.generation_time_ms}
                      confidence={response.confidence}
                      chunksRetrieved={response.sources.length}
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Sources */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <LayersIcon className="w-4 h-4 text-text-tertiary" />
                      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Retrieved Sources
                      </h3>
                    </div>
                    <SourcePanel
                      sources={response.sources}
                      highlightedCitation={highlightedCitation}
                      onCitationHover={setHighlightedCitation}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
                    <LayersIcon className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <p className="text-sm text-text-secondary">No response yet</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Ask a question to see metrics and sources
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed Panel Toggle */}
      <AnimatePresence>
        {isPanelCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsPanelCollapsed(false)}
            className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 items-center gap-2 px-3 py-6 rounded-xl bg-surface-elevated border border-border shadow-premium-lg hover:shadow-premium-xl transition-all group"
          >
            <ChevronRightIcon className="w-4 h-4 text-text-tertiary group-hover:text-brand-500 rotate-180 transition-colors" />
            <div className="flex flex-col items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-text-tertiary" />
              <LayersIcon className="w-4 h-4 text-text-tertiary" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
