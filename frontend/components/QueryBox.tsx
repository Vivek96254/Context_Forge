'use client';

import { useState } from 'react';
import { useQuery } from '@/hooks/useQuery';

interface QueryBoxProps {
  onResult?: (response: any) => void;
}

export default function QueryBox({ onResult }: QueryBoxProps) {
  const [queryText, setQueryText] = useState('');
  const [topK, setTopK] = useState(5);
  const { query, loading, error, response, reset } = useQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    try {
      const result = await query({ query: queryText, top_k: topK });
      if (onResult) {
        onResult(result);
      }
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  const handleReset = () => {
    setQueryText('');
    reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ask a Question</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Question
          </label>
          <textarea
            id="query"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Enter your question here..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        <div>
          <label htmlFor="topK" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Number of Sources (top-k): {topK}
          </label>
          <input
            id="topK"
            type="range"
            min="1"
            max="10"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!queryText.trim() || loading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {(queryText || response || error) && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {loading && (
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Processing your query...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Query Failed</h3>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
