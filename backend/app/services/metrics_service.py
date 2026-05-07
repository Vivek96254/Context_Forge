from typing import Dict, Any, List
from collections import defaultdict
import time
import logging
import json

logger = logging.getLogger(__name__)


class MetricsService:
    def __init__(self):
        self.metrics = defaultdict(list)
    
    def record_metric(
        self,
        metric_name: str,
        value: float,
        tags: Dict[str, Any] = None
    ):
        timestamp = time.time()
        
        metric_entry = {
            "timestamp": timestamp,
            "value": value,
            "tags": tags or {}
        }
        
        self.metrics[metric_name].append(metric_entry)
        
        log_data = {
            "event_type": "metric",
            "metric_name": metric_name,
            "value": value,
            "timestamp": timestamp
        }
        
        if tags:
            log_data.update(tags)
        
        logger.info(json.dumps(log_data))
    
    def aggregate_metrics(self, metric_name: str, window_seconds: int = 3600) -> Dict[str, float]:
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        
        recent_values = [
            entry["value"]
            for entry in self.metrics.get(metric_name, [])
            if entry["timestamp"] >= cutoff_time
        ]
        
        if not recent_values:
            return {
                "count": 0,
                "avg": 0.0,
                "min": 0.0,
                "max": 0.0,
                "p50": 0.0,
                "p95": 0.0,
                "p99": 0.0
            }
        
        sorted_values = sorted(recent_values)
        count = len(sorted_values)
        
        return {
            "count": count,
            "avg": sum(sorted_values) / count,
            "min": sorted_values[0],
            "max": sorted_values[-1],
            "p50": sorted_values[int(count * 0.50)],
            "p95": sorted_values[int(count * 0.95)] if count > 1 else sorted_values[0],
            "p99": sorted_values[int(count * 0.99)] if count > 1 else sorted_values[0]
        }
    
    def get_all_metrics_summary(self, window_seconds: int = 3600) -> Dict[str, Any]:
        summary = {}
        
        for metric_name in self.metrics.keys():
            summary[metric_name] = self.aggregate_metrics(metric_name, window_seconds)
        
        return summary


_metrics_service_instance = None


def get_metrics_service() -> MetricsService:
    global _metrics_service_instance
    
    if _metrics_service_instance is None:
        _metrics_service_instance = MetricsService()
    
    return _metrics_service_instance
