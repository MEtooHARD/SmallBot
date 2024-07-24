function roundAndAdjust(a, b, precision = 2) {
    const factor = Math.pow(10, precision);
    let roundedA = Math.round(a * factor) / factor;
    let roundedB = Math.round(b * factor) / factor;

    // Calculate the discrepancy
    let discrepancy = 100 - (roundedA + roundedB);

    // Adjust the second value to correct the discrepancy
    let adjustedB = roundedB + discrepancy;

    return { roundedA, adjustedB };
}

console.log(roundAndAdjust(57.888, 42.112));