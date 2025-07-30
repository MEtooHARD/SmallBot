type TimeUnit = 'sec' | 'min' | 'hour';
enum TimeUnit_sec {
    sec = 1,
    min = 60,
    hour = 3_600
}

/**
 * Uses an array to store the count of events in a rolling window.
 * The window is divided into cells of a specified size.
 * 
 * ***destroy() should be called when the counter is no longer needed, otherwise the internal interval will be left alone.***
 */
export class RateCounter {
    private count: number;
    private counter: number[];
    private cellSizeOfSec: number;
    private fullRangeOfSec: number;
    private intervalId: NodeJS.Timeout;
    private lastReset: number = Date.now();

    /**
     * set the `precision`, `p_range` and `range` carefully as it effects the precision of the results and consumes memory.
     * 
     * the total range is **`precision` * `p_size` * `amount`**.
     *  
     * @param amount - the amount of cells in the window
     * @param p_size - the amount of unit of each cell
     * @param precision - the unit of each cell. where `p_size` is the amount of unit of each cell
     * 
     * 'sec': 1, 'min': 60, 'hour': 3600
     */
    constructor(
        amount: number = 5,
        p_size: number = 1,
        precision: TimeUnit = 'sec'
    ) {
        this.counter = Array.from({ length: amount }, _ => 0);
        this.count = 0;
        this.cellSizeOfSec = TimeUnit_sec[precision] * p_size;
        this.fullRangeOfSec = TimeUnit_sec[precision] * p_size * amount;

        this.intervalId = this.setTimer();
    }
    /**
     * Calculates the rate of events over a specified amount and unit of time.
     * @param amount - The amount of time to calculate the rate for.
     * @param unit - The unit of time for the calculation.
     * @returns The calculated rate of events.
     */
    rateOf(amount: number, unit: TimeUnit): number {
        if (amount <= 0) {
            console.warn('RateCounter: amount should be greater than 0');
            return 0;
        }
        if (!isFinite(amount)) {
            console.warn('RateCounter: amount should be finite. received:', amount);
            return 0;
        }
        const requestedSec = amount * TimeUnit_sec[unit];
        if (requestedSec > this.fullRangeOfSec) {
            console.warn('RateCounter: requestedSec exceeds full range');
        }
        const currentElapsedSec = (Date.now() - this.lastReset) / 1000;
        const curRate = currentElapsedSec > 0
            ? this.count * (Math.min(requestedSec, currentElapsedSec) / currentElapsedSec)
            : 0;

        const requestedInRecordSec = Math.max(requestedSec - currentElapsedSec, 0);
        if (requestedInRecordSec === 0) return curRate;

        const fullCell = Math.floor(requestedInRecordSec / this.cellSizeOfSec);
        const main = this.counter.slice(0, fullCell).reduce((acc, cur) => acc + cur, 0);

        const partial = requestedInRecordSec % this.cellSizeOfSec / this.cellSizeOfSec;
        const leftOver = partial > 0 && requestedInRecordSec < this.fullRangeOfSec
            ? this.counter[fullCell] * partial
            : 0;

        return curRate + main + leftOver;
    }

    rps(second: number = 1): number { return this.rateOf(second, 'sec') / second; }
    rpm(minute: number = 1): number { return this.rateOf(minute, 'min') / minute; }
    rph(hour: number = 1): number { return this.rateOf(hour, 'hour') / hour; }

    accumulate(amount: number) { this.count += amount; }
    destroy() { clearInterval(this.intervalId); }
    reset(resetTimer: boolean = false) {
        this.count = 0;
        this.counter.fill(0);
        if (resetTimer) this.intervalId = this.setTimer();
    }
    rotate() {
        this.counter.unshift(this.count);
        this.lastReset = Date.now();
        this.count = 0;
        this.counter.pop();
    }
    setTimer() {
        this.lastReset = Date.now();
        return setInterval(this.rotate.bind(this), this.cellSizeOfSec * 1000);
    }
} 