
type SetFunc = (n: number) => n is number;

export class AbSet {
    /**
     * Whether the given n is a valid number.
     */
    private static Safe: SetFunc = (n: number): n is number => Number.isFinite(n);
    /**
     * Integers 
     */
    static Z: SetFunc = (n: number): n is number => this.Safe(n) && Number.isInteger(n);
    /**
     * Natural Numbers
     */
    static N: SetFunc = (n: number): n is number => this.Z(n) && n > 0;
    /**
     * Whole Numbers
     */
    static W: SetFunc = (n: number): n is number => this.Z(n) && n >= 0;
    /**
     * Rational Numbers
     */
    static Q: SetFunc = (n: number): n is number => this.Safe(n);
    /**
     * Even Numbers
     */
    static Even: SetFunc = (n: number): n is number => this.Z(n) && n % 2 === 0;
    /**
     * Odd Numbers
     */
    static Odd: SetFunc = (n: number): n is number => this.Z(n) && n % 2 === 1;
    /**
     * Prime Numbers
     */
    static Prime = (x: number) => {
        if (x <= 1) return false
        if (x < 4) return true
        if (x % 2 === 0) return false
        if (x < 9) return true
        if (x % 3 === 0) return false
        const sqrt = Math.sqrt(x)
        for (let i = 5; i <= sqrt; i += 6) {
            if (x % i === 0) return false
            if (x % (i + 2) === 0) return false
        }
        return true
    }
}