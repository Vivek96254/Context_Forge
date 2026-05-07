'use client';

import type { QueryResponse } from '@/types/api';

interface AnswerCardProps {
  response: QueryResponse;
}

export default function AnswerCard({ response }: AnswerCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Answer</h2>

      {response.rewritten_query && response.rewritten_query !== response.query && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Rewritten Query</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">{response.rewritten_query}</p>
        </div>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
          {response.answer}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Confidence</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {response.confidence !== null ? `${(response.confidence * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Retrieval Time</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {response.retrieval_time_ms.toFixed(0)}ms
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Generation Time</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {response.generation_time_ms.toFixed(0)}ms
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Total Latency: {(response.retrieval_time_ms + response.generation_time_ms).toFixed(0)}ms
        </p>
      </div>
    </div>
  );
}
