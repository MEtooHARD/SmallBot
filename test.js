class A {
    b = 'abc';
}

const a = {
    c: new A()
}

console.log(JSON.parse(JSON.stringify(a)))
