export interface RateLimiterConfig {
  maxRequestsPerMinute?: number;
  maxTokensPerMinute?: number;
}

export interface RateLimiterStatus {
  requestsRemaining: number;
  tokensRemaining: number;
  resetInMs: number;
}

export class RateLimiter {
  private requests: { timestamp: number; tokens: number }[] = [];
  private maxRequestsPerMinute: number;
  private maxTokensPerMinute: number;

  constructor(config: RateLimiterConfig = {}) {
    this.maxRequestsPerMinute = config.maxRequestsPerMinute ?? 60;
    this.maxTokensPerMinute = config.maxTokensPerMinute ?? 90000;
  }

  private pruneOldRecords(): void {
    const now = Date.now();
    this.requests = this.requests.filter(r => now - r.timestamp < 60000);
  }

  getStatus(): RateLimiterStatus {
    this.pruneOldRecords();
    const now = Date.now();
    const usedTokens = this.requests.reduce((sum, r) => sum + r.tokens, 0);
    const oldestTimestamp = this.requests[0]?.timestamp ?? now;

    return {
      requestsRemaining: Math.max(0, this.maxRequestsPerMinute - this.requests.length),
      tokensRemaining: Math.max(0, this.maxTokensPerMinute - usedTokens),
      resetInMs: Math.max(0, 60000 - (now - oldestTimestamp)),
    };
  }

  canProceed(estimatedTokens: number = 1000): boolean {
    const status = this.getStatus();
    return status.requestsRemaining > 0 && status.tokensRemaining >= estimatedTokens;
  }

  async execute<T>(fn: () => Promise<T>, estimatedTokens: number = 1000): Promise<T> {
    await this.waitForSlot(estimatedTokens);
    return await fn();
  }

  recordUsage(actualTokens: number): void {
    const lastRequest = this.requests[this.requests.length - 1];
    if (lastRequest) {
      lastRequest.tokens = actualTokens;
    }
  }

  private async waitForSlot(estimatedTokens: number = 1000): Promise<void> {
    while (!this.canProceed(estimatedTokens)) {
      const status = this.getStatus();
      const waitTime = Math.max(status.resetInMs, 1000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.requests.push({ timestamp: Date.now(), tokens: estimatedTokens });
  }
}