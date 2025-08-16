export enum CircuitState {
    CLOSED = 'closed',     // Normal operation
    OPEN = 'open',         // Failing, reject requests
    HALF_OPEN = 'half_open' // Testing if service recovered
}

export interface CircuitBreakerConfig {
    failureThreshold: number;    // Number of failures before opening
    recoveryTimeout: number;     // Time to wait before trying again (ms)
    monitoringPeriod: number;    // Time window for counting failures (ms)
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failures: number = 0;
    private lastFailureTime: number = 0;
    private nextAttemptTime: number = 0;

    constructor(private config: CircuitBreakerConfig) { }

    public async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttemptTime) {
                throw new Error('Circuit breaker is OPEN - operation blocked');
            }
            // Try to recover
            this.state = CircuitState.HALF_OPEN;
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = CircuitState.CLOSED;
    }

    private onFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
        }
    }

    public getState(): CircuitState {
        return this.state;
    }

    public getStats(): {
        state: CircuitState;
        failures: number;
        nextAttemptTime?: number;
    } {
        return {
            state: this.state,
            failures: this.failures,
            nextAttemptTime: this.state === CircuitState.OPEN ? this.nextAttemptTime : undefined
        };
    }
}

// Enhanced KeyManager with Circuit Breaker
export class EnhancedKeyManager {
    private circuitBreakers: Map<string, CircuitBreaker> = new Map();
    private readonly breakerConfig: CircuitBreakerConfig = {
        failureThreshold: 3,     // 3 failures
        recoveryTimeout: 60000,  // 1 minute
        monitoringPeriod: 300000 // 5 minutes
    };

    /**
     * Execute an API call with circuit breaker protection
     */
    public async executeWithCircuitBreaker<T>(
        key: string,
        operation: () => Promise<T>
    ): Promise<T> {
        if (!this.circuitBreakers.has(key)) {
            this.circuitBreakers.set(key, new CircuitBreaker(this.breakerConfig));
        }

        const breaker = this.circuitBreakers.get(key)!;
        return breaker.execute(operation);
    }

    /**
     * Get circuit breaker status for all keys
     */
    public getCircuitBreakerStatus(): Map<string, ReturnType<CircuitBreaker['getStats']>> {
        const status = new Map();
        for (const [key, breaker] of this.circuitBreakers) {
            status.set(key, breaker.getStats());
        }
        return status;
    }
}
