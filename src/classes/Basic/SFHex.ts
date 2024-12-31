import { Snowflake } from "discord.js";

/**
 * Snoeflake Hexadecimal representation
 */
export class SFHex {
    protected value: bigint;

    constructor(v: Snowflake | number | bigint | string) {
        this.value = BigInt(v);
    }
    /**
     * create a new instance from a hexidecimal string
     * @param hex hexidecimal string
     * @returns new instance
     */
    static fromHex(hex: string): SFHex { return new SFHex(BigInt(`0x${hex}`)); }

    /**
     * hexidecimal form
     */
    get hex(): string { return this.value.toString(16); }

    /**
     * decimal form
     */
    get dec(): string { return this.value.toString(); }

    /**
     * default string representation as decimal form
     */
    toString(): string { return this.dec; }

    /**
     * value as the bigint value
     */
    valueOf(): bigint { return this.value; }
}