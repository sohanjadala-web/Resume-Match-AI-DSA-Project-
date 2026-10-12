package com.resumematch.algorithms;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Live Runtime Telemetry & Complexity Tracker
 * 
 * Records high-precision execution timings using System.nanoTime(),
 * theoretical vs measured complexity, and keeps an in-memory audit log
 * for admin dashboards and viva demonstrations.
 */
public class DSAMetricsTracker {

    public static class MetricEntry {
        public final String id;
        public final String algorithmName;
        public final double executionTimeMs;
        public final int inputSize;
        public final Integer itemCount;
        public final String notes;
        public final long timestamp;

        public MetricEntry(String algorithmName, double executionTimeMs, int inputSize, Integer itemCount, String notes) {
            this.id = UUID.randomUUID().toString();
            this.algorithmName = algorithmName;
            this.executionTimeMs = Math.round(executionTimeMs * 1000.0) / 1000.0;
            this.inputSize = inputSize;
            this.itemCount = itemCount;
            this.notes = notes;
            this.timestamp = System.currentTimeMillis();
        }
    }

    private static final Queue<MetricEntry> metricsHistory = new ConcurrentLinkedQueue<>();

    public static void recordMetric(String algorithmName, double executionTimeMs, int inputSize, Integer itemCount, String notes) {
        metricsHistory.add(new MetricEntry(algorithmName, executionTimeMs, inputSize, itemCount, notes));
        // Keep last 500 metrics to avoid memory buildup
        while (metricsHistory.size() > 500) {
            metricsHistory.poll();
        }
    }

    @FunctionalInterface
    public interface Measurable<T> {
        T execute() throws Exception;
    }

    public static class TimedResult<T> {
        public final T result;
        public final double executionTimeMs;

        public TimedResult(T result, double executionTimeMs) {
            this.result = result;
            this.executionTimeMs = Math.round(executionTimeMs * 1000.0) / 1000.0;
        }
    }

    public static <T> TimedResult<T> measure(String algorithmName, int inputSize, Measurable<T> task, Integer itemCount, String notes) {
        long start = System.nanoTime();
        T res;
        try {
            res = task.execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        long end = System.nanoTime();
        double ms = (end - start) / 1_000_000.0;

        recordMetric(algorithmName, ms, inputSize, itemCount, notes);
        return new TimedResult<>(res, ms);
    }

    public static List<MetricEntry> getRecentMetrics() {
        return new ArrayList<>(metricsHistory);
    }
}
