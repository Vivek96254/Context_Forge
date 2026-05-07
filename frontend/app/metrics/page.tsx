'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChartIcon,
  ClockIcon,
  ZapIcon,
  TargetIcon,
  LayersIcon,
  TrendingUpIcon,
  RefreshIcon,
  ActivityIcon,
} from '@/components/ui/Icons';
import { getMetrics } from '@/lib/api';
import type { MetricsResponse } from '@/types/api';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowHours, setWindowHours] = useState(24);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMetrics(windowHours);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [windowHours]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const timeWindows = [
    { value: 1, label: '1 Hour' },
    { value: 6, label: '6 Hours' },
    { value: 24, label: '24 Hours' },
    { value: 168, label: '7 Days' },
  ];

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    gradient,
    delay = 0,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    gradient: string;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-premium p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-tertiary mb-1">{label}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {subValue && (
            <p className="text-xs text-text-secondary mt-1">{subValue}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ActivityIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Failed to Load Metrics
          </h2>
          <p className="text-sm text-text-secondary mb-6">{error}</p>
          <button onClick={loadMetrics} className="btn-primary">
            <RefreshIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <ChartIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              System Metrics
            </h1>
            <p className="text-sm text-text-secondary">
              Monitor performance and usage statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Window Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-secondary">
            {timeWindows.map((tw) => (
              <button
                key={tw.value}
                onClick={() => setWindowHours(tw.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  windowHours === tw.value
                    ? 'bg-surface-elevated text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {tw.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadMetrics}
            disabled={loading}
            className="btn-secondary"
          >
            <RefreshIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {loading && !metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-premium p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-4 w-20 skeleton rounded mb-2" />
                  <div className="h-8 w-16 skeleton rounded" />
                </div>
                <div className="w-12 h-12 skeleton rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : metrics ? (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={ActivityIcon}
              label="Total Queries"
              value={metrics.total_queries.toLocaleString()}
              subValue={`Last ${windowHours}h`}
              gradient="from-brand-500 to-violet-500"
              delay={0.1}
            />
            <MetricCard
              icon={ClockIcon}
              label="Avg Response Time"
              value={`${metrics.average_latencies.response_time_ms.toFixed(0)}ms`}
              subValue="End-to-end latency"
              gradient="from-amber-500 to-orange-500"
              delay={0.2}
            />
            <MetricCard
              icon={TargetIcon}
              label="Avg Confidence"
              value={`${(metrics.confidence_stats.avg * 100).toFixed(1)}%`}
              subValue={`Range: ${(metrics.confidence_stats.min * 100).toFixed(0)}% - ${(metrics.confidence_stats.max * 100).toFixed(0)}%`}
              gradient="from-emerald-500 to-teal-500"
              delay={0.3}
            />
            <MetricCard
              icon={LayersIcon}
              label="Avg Chunks Retrieved"
              value={metrics.chunks_stats.avg_retrieved.toFixed(1)}
              subValue={`After RBAC: ${metrics.chunks_stats.avg_after_rbac.toFixed(1)}`}
              gradient="from-rose-500 to-pink-500"
              delay={0.4}
            />
          </div>

          {/* Latency Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid lg:grid-cols-2 gap-6 mb-8"
          >
            {/* Latency Card */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-2 mb-6">
                <ZapIcon className="w-5 h-5 text-brand-500" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Latency Breakdown
                </h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    label: 'Retrieval',
                    value: metrics.average_latencies.retrieval_time_ms,
                    color: 'bg-brand-500',
                    percentage: (metrics.average_latencies.retrieval_time_ms / metrics.average_latencies.response_time_ms) * 100,
                  },
                  {
                    label: 'Generation',
                    value: metrics.average_latencies.generation_time_ms,
                    color: 'bg-violet-500',
                    percentage: (metrics.average_latencies.generation_time_ms / metrics.average_latencies.response_time_ms) * 100,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">{item.label}</span>
                      <span className="text-sm font-semibold text-text-primary">
                        {item.value.toFixed(0)}ms ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-tertiary">Total Response Time</span>
                  <span className="text-lg font-bold text-text-primary">
                    {metrics.average_latencies.response_time_ms.toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Distribution */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-2 mb-6">
                <TargetIcon className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Confidence Distribution
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Minimum', value: metrics.confidence_stats.min, color: 'text-red-500' },
                  { label: 'Maximum', value: metrics.confidence_stats.max, color: 'text-emerald-500' },
                  { label: 'Average', value: metrics.confidence_stats.avg, color: 'text-brand-500' },
                  { label: 'Median (P50)', value: metrics.confidence_stats.p50, color: 'text-violet-500' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-surface-secondary/50"
                  >
                    <p className="text-xs text-text-tertiary mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {(stat.value * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Provider Distribution */}
          {Object.keys(metrics.provider_distribution).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card-premium p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUpIcon className="w-5 h-5 text-violet-500" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Provider Distribution
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(metrics.provider_distribution).map(([provider, count], index) => {
                  const total = Object.values(metrics.provider_distribution).reduce((a, b) => a + b, 0);
                  const percentage = (count / total) * 100;
                  
                  return (
                    <motion.div
                      key={provider}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="p-4 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />
                        <span className="text-sm font-medium text-text-primary capitalize">
                          {provider}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{count}</p>
                      <p className="text-xs text-text-tertiary">{percentage.toFixed(1)}% of queries</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      ) : null}
    </div>
  );
}
