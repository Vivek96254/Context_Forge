'use client';

import { useState, useEffect } from 'react';
import { getMetrics } from '@/lib/api';
import type { MetricsResponse } from '@/types/api';

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowHours, setWindowHours] = useState(24);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMetrics(windowHours);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [windowHours]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Metrics</h3>
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics || metrics.total_queries === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">No Data Available</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          No queries have been processed in the last {windowHours} hours.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Metrics</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Window:</label>
          <select
            value={windowHours}
            onChange={(e) => setWindowHours(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={24}>24 hours</option>
            <option value={168}>7 days</option>
          </select>
          <button
            onClick={fetchMetrics}
            className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Queries</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.total_queries}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Avg Response Time</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.average_latencies.response_time_ms.toFixed(0)}
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">ms</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Avg Confidence</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {(metrics.confidence_stats.avg * 100).toFixed(1)}
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">%</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Avg Chunks</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.chunks_stats.avg_retrieved.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latency Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Retrieval Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.average_latencies.retrieval_time_ms.toFixed(2)} ms
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (metrics.average_latencies.retrieval_time_ms /
                        metrics.average_latencies.response_time_ms) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Generation Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.average_latencies.generation_time_ms.toFixed(2)} ms
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      (metrics.average_latencies.generation_time_ms /
                        metrics.average_latencies.response_time_ms) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Provider Distribution</h3>
          <div className="space-y-2">
            {Object.entries(metrics.provider_distribution).map(([provider, count]) => (
              <div key={provider} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{provider}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(count / metrics.total_queries) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confidence Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {(metrics.confidence_stats.avg * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Median (P50)</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {(metrics.confidence_stats.p50 * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Minimum</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {(metrics.confidence_stats.min * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Maximum</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {(metrics.confidence_stats.max * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
