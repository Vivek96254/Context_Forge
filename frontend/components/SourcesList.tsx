'use client';

import type { SourceReference } from '@/types/api';

interface SourcesListProps {
  sources: SourceReference[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Sources ({sources.length})
      </h2>

      <div className="space-y-4">
        {sources.map((source, index) => (
          <div
            key={`${source.document_id}-${source.chunk_index}`}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {source.filename}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Document ID: {source.document_id}</span>
                  <span>•</span>
                  <span>Chunk: {source.chunk_index}</span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <div className="px-2 py-1 bg-primary-100 dark:bg-primary-900 rounded text-xs font-medium text-primary-700 dark:text-primary-300">
                  Score: {source.score.toFixed(3)}
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {source.content.length > 300
                ? `${source.content.substring(0, 300)}...`
                : source.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
