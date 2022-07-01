export function linealInterp(X1, Y1, X2, Y2, X) {
    const Y3 = Y1 + (X-X1)*(Y2-Y1)/(X2-X1);
    return parseFloat(Y3);
}