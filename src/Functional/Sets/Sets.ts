
type Domain = (n: number) => boolean;

type Set = (A: Domain, B: Domain) => Domain;

export class Domains {
    protected _customs: Map<string, Domain> = new Map<string, Domain>();

    static union: Set = (A, B) => (n: number) => A(n) || B(n);

    static intersec: Set = (A, B) => (n: number) => A(n) && B(n);

    static difference: Set = (A, B) => (n: number) => A(n) && !B(n);

    static symDifference: Set = (A, B) => (n: number) => this.union(A, B)(n) && !this.intersec(A, B)(n);

    static Even: Domain = (n: number): boolean => n % 2 === 0;

    static Odd: Domain = (n: number): boolean => n % 2 === 1;

    static Z: Domain = (n: number): boolean => n % 1 === 0;

    static N: Domain = (n: number): boolean => Domains.Z(n) && n >= 0;
}

Domains.Even(2);

// const a = Domain.Even(2);

/* 
export interface Domain {
    isMember: (n: number) => boolean;
}

export class Sets {
    static Even: Domain = {
        isMember: (n: number) => n % 2 === 0,
    };

    static Odd: Domain = {
        isMember: (n: number) => n % 2 === 1,
    };

    static Z: Domain = {
        isMember: (n: number) => n % 1 === 0,
    };

    static N: Domain = {
        isMember: (n: number) => Sets.Z.isMember(n) && n >= 0,
    };
}
*/
