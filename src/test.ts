
type f1 = (i: number) => string;
type f2 = (i: string) => void;
type f<T extends any> =
    T extends number ? f1 :
    T extends string ? f2 :
    never;

abstract class a<T extends any> {
    abstract f(i: Parameters<f<T>>[0]): Promise<ReturnType<f<T>>>;
}

abstract class b extends a<number> { }

const C = new class c extends b {
    async f(i: number) {
        return "result";
    }
}