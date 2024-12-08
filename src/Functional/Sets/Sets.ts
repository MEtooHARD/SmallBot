

export class Sets {
    private _sets: Map<string, Set<any>> = new Map<string, Set<any>>();

    constructor() { }


}

export namespace Sets {
    export class Domain {

        Even(n: number): boolean { return n % 2 === 0; }

        Odd(n: number): boolean { return n % 2 === 1; }

        Z(n: number): boolean { return n % 1 === 0; }

        N(n: number): boolean { return this.Z(n) && n >= 0 }
    }
}

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

/* 
export class Sets {
    static custom(predicate: (n: number) => boolean): (n: number) => boolean {
        return predicate;
    }

    static Even = Sets.custom((n) => n % 2 === 0);
    static Odd = Sets.custom((n) => n % 2 === 1);
    static Z = Sets.custom((n) => n % 1 === 0);
    static N = Sets.custom((n) => Sets.Z(n) && n >= 0);
}
 */