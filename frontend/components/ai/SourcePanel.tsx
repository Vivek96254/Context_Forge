'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayersIcon, 
  FileIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HashIcon,
} from '@/components/ui/Icons';
import CitationCard from './CitationCard';
import type { SourceReference } from '@/types/api';

interface SourcePanelProps {
  sources: SourceReference[];
  highlightedCitation?: number | null;
  onCitationHover?: (index: number | null) => void;
}

interface GroupedSource {
  filename: string;
  documentId: number;
  chunks: SourceReference[];
  avgScore: number;
}

export default function SourcePanel({ 
  sources, 
  highlightedCitation,
  onCitationHover,
}: SourcePanelProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const groupedSources = useMemo(() => {
    const groups: Record<string, GroupedSource> = {};
    
    sources.forEach((source) => {
      const key = source.filename;
      if (!groups[key]) {
        groups[key] = {
          filename: source.filename,
          documentId: source.document_id,
          chunks: [],
          avgScore: 0,
        };
      }
      groups[key].chunks.push(source);
    });

    Object.values(groups).forEach((group) => {
      group.avgScore = group.chunks.reduce((sum, c) => sum + c.score, 0) / group.chunks.length;
    });

    return Object.values(groups).sort((a, b) => b.avgScore - a.avgScore);
  }, [sources]);

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
          <LayersIcon className="w-6 h-6 text-text-tertiary" />
        </div>
        <p className="text-sm text-text-secondary">No sources retrieved</p>
        <p className="text-xs text-text-tertiary mt-1">
          Try a different query to find relevant documents
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <LayersIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              Sources
            </h3>
            <p className="text-xs text-text-tertiary">
              {sources.length} chunk{sources.length !== 1 ? 's' : ''} from {groupedSources.length} document{groupedSources.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isCollapsed ? (
            <ChevronDownIcon className="w-4 h-4 text-text-tertiary" />
          ) : (
            <ChevronUpIcon className="w-4 h-4 text-text-tertiary" />
          )}
        </button>

        {/* View Toggle */}
        {!isCollapsed && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-secondary">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-surface-elevated text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'grouped'
                  ? 'bg-surface-elevated text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Grouped
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {sources.map((source, index) => (
                  <CitationCard
                    key={`${source.document_id}-${source.chunk_index}`}
                    source={source}
                    index={index}
                    isHighlighted={highlightedCitation === index}
                    onHover={onCitationHover}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {groupedSources.map((group) => (
                  <GroupedSourceCard 
                    key={group.documentId} 
                    group={group}
                    highlightedCitation={highlightedCitation}
                    onCitationHover={onCitationHover}
                    sources={sources}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GroupedSourceCardProps {
  group: GroupedSource;
  highlightedCitation?: number | null;
  onCitationHover?: (index: number | null) => void;
  sources: SourceReference[];
}

function GroupedSourceCard({ group, highlightedCitation, onCitationHover, sources }: GroupedSourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated overflow-hidden">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <FileIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-text-primary">{group.filename}</h4>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <HashIcon className="w-3 h-3" />
                {group.chunks.length} chunk{group.chunks.length !== 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span>Avg: {(group.avgScore * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Chunk Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {group.chunks.slice(0, 3).map((chunk) => (
              <span
                key={chunk.chunk_index}
                className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-tertiary text-text-secondary"
              >
                #{chunk.chunk_index}
              </span>
            ))}
            {group.chunks.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-tertiary text-text-tertiary">
                +{group.chunks.length - 3}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-text-tertiary" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-text-tertiary" />
          )}
        </div>
      </button>

      {/* Expanded Chunks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border-subtle"
          >
            <div className="p-4 space-y-3">
              {group.chunks.map((source) => {
                const globalIndex = sources.findIndex(
                  (s) => s.document_id === source.document_id && s.chunk_index === source.chunk_index
                );
                return (
                  <CitationCard
                    key={`${source.document_id}-${source.chunk_index}`}
                    source={source}
                    index={globalIndex}
                    isHighlighted={highlightedCitation === globalIndex}
                    onHover={onCitationHover}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
