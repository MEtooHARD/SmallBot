
const logreport = (n, t) => console.log(`${n} is ${t ? '' : 'not'} correct.`);

const val = (a, b, c) => {
    console.log(`A: ${a} B: ${b} C: ${c}`);

    logreport('A', a && (!b && c));
    logreport('B', b && (a === b));
    logreport('C', c && !(a && b));
    // if (a)
    //     logreport('A', !b && c);
    // else
    //     logreport('A', false);

    // if (b)
    //     logreport('B', a === b);
    // else
    //     logreport('B', false);
    // if (c)
    //     logreport('C', !(a && b));
    // else
    //     logreport('C', false);
};


[0, 1].forEach(a => {
    [0, 1].forEach(b => {
        [0, 1].forEach(c => {
            val(a, b, c);
            console.log('\n');
        })
    })
});