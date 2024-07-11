const a = Array.from({ length: 10 }, (_, i) => i);

const splitArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

console.log(splitArray(a, 3));