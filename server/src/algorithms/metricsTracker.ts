import { PrismaClient } from '@prisma/client';

export class DSAMetricsTracker {
  private static prisma: PrismaClient;

  public static init(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Log an algorithm execution asynchronously
   */
  public static async recordMetric(
    algorithmName: 'Aho-Corasick' | 'KMP' | 'Levenshtein' | 'CompatibilityScoring' | 'HungarianMatching' | 'GreedySetCover',
    executionTimeMs: number,
    inputSize: number,
    itemCount?: number,
    notes?: string
  ): Promise<void> {
    if (!this.prisma) return;

    try {
      await this.prisma.algorithmMetric.create({
        data: {
          algorithmName,
          executionTimeMs,
          inputSize,
          itemCount: itemCount || null,
          notes: notes || null,
        },
      });
    } catch (err) {
      console.error('Failed to save algorithm metric:', err);
    }
  }

  /**
   * Measure execution time of a synchronous or asynchronous function
   */
  public static async measure<T>(
    algorithmName: 'Aho-Corasick' | 'KMP' | 'Levenshtein' | 'CompatibilityScoring' | 'HungarianMatching' | 'GreedySetCover',
    inputSize: number,
    fn: () => Promise<T> | T,
    itemCount?: number,
    notes?: string
  ): Promise<{ result: T; executionTimeMs: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const executionTimeMs = parseFloat((end - start).toFixed(3));

    // Fire and forget metric logging
    this.recordMetric(algorithmName, executionTimeMs, inputSize, itemCount, notes);

    return { result, executionTimeMs };
  }
}
