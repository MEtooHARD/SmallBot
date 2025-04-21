/**
 * starts from 0, 1, 1, 2, 3...
 * the first index is 1
 */
class Fibonacci {
    _fibonacci = [BigInt(0), BigInt(1)];
    _cap = 2;

    grow(growth: number): void {
        if (growth <= 0) return; // Prevent negative/zero growth

        if (growth > 2) {
            const fibos = new Array(growth);
            fibos[0] = this._fibonacci[this._cap - 1] + this._fibonacci[this._cap - 2];
            fibos[1] = this._fibonacci[this._cap - 1] * BigInt(2) + this._fibonacci[this._cap - 2];
            for (let i = 2; i < growth; i++) fibos[i] = fibos[i - 1] + fibos[i - 2];
            this._fibonacci = this._fibonacci.concat(fibos);
        }
        else if (growth === 1)
            this._fibonacci.push(this._fibonacci[this._cap - 1] + this._fibonacci[this._cap - 2]);
        else if (growth === 2) {
            this._fibonacci.push(
                this._fibonacci[this._cap - 1] + this._fibonacci[this._cap - 2],
                this._fibonacci[this._cap - 1] * BigInt(2) + this._fibonacci[this._cap - 2]
            );
        }
        this._cap += growth;
    }

    get(n: number): BigInt {
        if (!Number.isInteger(n) || n < 1)
            throw new Error("Fibonacci sequence only supports positive integers");
        if (this._cap < n) this.grow(n - this._cap);
        return this._fibonacci[n - 1];
    }
}