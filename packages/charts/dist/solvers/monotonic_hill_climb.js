"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monotonicHillClimb = exports.integerSnap = void 0;
function integerSnap(n) {
    return Math.floor(n);
}
exports.integerSnap = integerSnap;
function monotonicHillClimb(getResponse, maxVar, responseUpperConstraint, domainSnap = (n) => n, minVar = 0) {
    let loVar = domainSnap(minVar);
    const loResponse = getResponse(loVar);
    let hiVar = domainSnap(maxVar);
    let hiResponse = getResponse(hiVar);
    if (loResponse > responseUpperConstraint || loVar > hiVar) {
        return NaN;
    }
    if (hiResponse <= responseUpperConstraint) {
        return hiVar;
    }
    let pivotVar = NaN;
    let pivotResponse = NaN;
    let lastPivotResponse = NaN;
    while (loVar < hiVar) {
        const newPivotVar = (loVar + hiVar) / 2;
        const newPivotResponse = getResponse(domainSnap(newPivotVar));
        if (newPivotResponse === pivotResponse || newPivotResponse === lastPivotResponse) {
            return domainSnap(loVar);
        }
        pivotVar = newPivotVar;
        lastPivotResponse = pivotResponse;
        pivotResponse = newPivotResponse;
        const pivotIsCompliant = pivotResponse <= responseUpperConstraint;
        if (pivotIsCompliant) {
            loVar = pivotVar;
        }
        else {
            hiVar = pivotVar;
            hiResponse = pivotResponse;
        }
    }
    return domainSnap(pivotVar);
}
exports.monotonicHillClimb = monotonicHillClimb;
//# sourceMappingURL=monotonic_hill_climb.js.map