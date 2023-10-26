"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRowCircline = exports.ringSectorConstruction = exports.angleToCircline = exports.INFINITY_RADIUS = exports.conjunctiveConstraint = void 0;
const constants_1 = require("../../../../common/constants");
const geometry_1 = require("../../../../common/geometry");
function euclideanDistance({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
function fullyContained(c1, c2) {
    return euclideanDistance(c1, c2) + c2.r <= c1.r;
}
function noOverlap(c1, c2) {
    return euclideanDistance(c1, c2) >= c1.r + c2.r;
}
function circlineIntersect(c1, c2) {
    const d = Math.sqrt((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y));
    if (c1.r + c2.r >= d && d >= Math.abs(c1.r - c2.r)) {
        const a1 = d + c1.r + c2.r;
        const a2 = d + c1.r - c2.r;
        const a3 = d - c1.r + c2.r;
        const a4 = -d + c1.r + c2.r;
        const area = Math.sqrt(a1 * a2 * a3 * a4) / 4;
        const xAux1 = (c1.x + c2.x) / 2 + ((c2.x - c1.x) * (c1.r * c1.r - c2.r * c2.r)) / (2 * d * d);
        const xAux2 = (2 * (c1.y - c2.y) * area) / (d * d);
        const x1 = xAux1 + xAux2;
        const x2 = xAux1 - xAux2;
        const yAux1 = (c1.y + c2.y) / 2 + ((c2.y - c1.y) * (c1.r * c1.r - c2.r * c2.r)) / (2 * d * d);
        const yAux2 = (2 * (c1.x - c2.x) * area) / (d * d);
        const y1 = yAux1 - yAux2;
        const y2 = yAux1 + yAux2;
        return [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
        ];
    }
    return [];
}
function circlineValidSectors(refC, c) {
    var _a, _b;
    const { inside } = refC;
    const { x, y, r, from, to } = c;
    const fullContainment = fullyContained(refC, c);
    const fullyOutside = noOverlap(refC, c) || fullyContained(c, refC);
    if ((inside && fullContainment) || (!inside && fullyOutside)) {
        return [];
    }
    if ((inside && fullyOutside) || (!inside && fullContainment)) {
        return [c];
    }
    const circlineIntersections = circlineIntersect(refC, c);
    const [p1, p2] = circlineIntersections;
    if (!p1 || !p2)
        return [];
    const aPre1 = Math.atan2(p1.y - c.y, p1.x - c.x);
    const aPre2 = Math.atan2(p2.y - c.y, p2.x - c.x);
    const a1p = Math.max(from, Math.min(to, aPre1 < 0 ? aPre1 + constants_1.TAU : aPre1));
    const a2p = Math.max(from, Math.min(to, aPre2 < 0 ? aPre2 + constants_1.TAU : aPre2));
    const a1 = Math.min(a1p, a2p);
    const a2 = a1p === a2p ? constants_1.TAU : Math.max(a1p, a2p);
    const breakpoints = [from];
    if (from < a1 && a1 < to)
        breakpoints.push(a1);
    if (from < a2 && a2 < to)
        breakpoints.push(a2);
    breakpoints.push(to);
    const predicate = inside ? noOverlap : fullyContained;
    const result = [];
    for (let i = 0; i < breakpoints.length - 1; i++) {
        const from = (_a = breakpoints[i]) !== null && _a !== void 0 ? _a : 0;
        const to = (_b = breakpoints[i + 1]) !== null && _b !== void 0 ? _b : 0;
        const midAngle = (from + to) / 2;
        const xx = x + r * Math.cos(midAngle);
        const yy = y + r * Math.sin(midAngle);
        if (predicate(refC, { x: xx, y: yy, r: 0 }))
            result.push({ x, y, r, from, to });
    }
    return result;
}
function conjunctiveConstraint(constraints, c) {
    let valids = [c];
    for (let i = 0; i < constraints.length; i++) {
        const refC = constraints[i];
        const nextValids = [];
        if (!refC)
            break;
        for (let j = 0; j < valids.length; j++) {
            const cc = valids[j];
            if (!cc)
                continue;
            const currentValids = circlineValidSectors(refC, cc);
            nextValids.push(...currentValids);
        }
        valids = nextValids;
    }
    return valids;
}
exports.conjunctiveConstraint = conjunctiveConstraint;
exports.INFINITY_RADIUS = 1e4;
function angleToCircline(midRadius, alpha, direction) {
    const sectorRadiusLineX = Math.cos(alpha) * midRadius;
    const sectorRadiusLineY = Math.sin(alpha) * midRadius;
    const normalAngle = alpha + (direction * Math.PI) / 2;
    const x = sectorRadiusLineX + exports.INFINITY_RADIUS * Math.cos(normalAngle);
    const y = sectorRadiusLineY + exports.INFINITY_RADIUS * Math.sin(normalAngle);
    return { x, y, r: exports.INFINITY_RADIUS, inside: false, from: 0, to: constants_1.TAU };
}
exports.angleToCircline = angleToCircline;
function ringSectorStartAngle(d) {
    return (0, geometry_1.trueBearingToStandardPositionAngle)(d.x0 + Math.max(0, d.x1 - d.x0 - constants_1.TAU / 2) / 2);
}
function ringSectorEndAngle(d) {
    return (0, geometry_1.trueBearingToStandardPositionAngle)(d.x1 - Math.max(0, d.x1 - d.x0 - constants_1.TAU / 2) / 2);
}
function ringSectorInnerRadius(innerRadius, ringThickness) {
    return (d) => innerRadius + d.y0 * ringThickness;
}
function ringSectorOuterRadius(innerRadius, ringThickness) {
    return (d) => innerRadius + (d.y0 + 1) * ringThickness;
}
function ringSectorConstruction({ fillOutside, radiusOutside, fillRectangleWidth, fillRectangleHeight }, { circlePadding, radialPadding }, innerRadius, ringThickness) {
    return (ringSector) => {
        const radiusGetter = fillOutside ? ringSectorOuterRadius : ringSectorInnerRadius;
        const geometricInnerRadius = radiusGetter(innerRadius, ringThickness)(ringSector);
        const innerR = geometricInnerRadius + circlePadding * 2;
        const outerR = Math.max(innerR, ringSectorOuterRadius(innerRadius, ringThickness)(ringSector) - circlePadding + (fillOutside ? radiusOutside : 0));
        const startAngle = ringSectorStartAngle(ringSector);
        const endAngle = ringSectorEndAngle(ringSector);
        const innerCircline = { x: 0, y: 0, r: innerR, inside: true, from: 0, to: constants_1.TAU };
        const outerCircline = { x: 0, y: 0, r: outerR, inside: false, from: 0, to: constants_1.TAU };
        const midRadius = (innerR + outerR) / 2;
        const sectorStartCircle = angleToCircline(midRadius, startAngle - radialPadding, -1);
        const sectorEndCircle = angleToCircline(midRadius, endAngle + radialPadding, 1);
        const outerRadiusFromRectangleWidth = fillRectangleWidth / 2;
        const outerRadiusFromRectanglHeight = fillRectangleHeight / 2;
        const fullCircle = ringSector.x0 === 0 && ringSector.x1 === constants_1.TAU && geometricInnerRadius === 0;
        const sectorCirclines = [
            ...(fullCircle && innerRadius === 0 ? [] : [innerCircline]),
            outerCircline,
            ...(fullCircle ? [] : [sectorStartCircle, sectorEndCircle]),
        ];
        const rectangleCirclines = outerRadiusFromRectangleWidth === Infinity && outerRadiusFromRectanglHeight === Infinity
            ? []
            : [
                { x: exports.INFINITY_RADIUS - outerRadiusFromRectangleWidth, y: 0, r: exports.INFINITY_RADIUS, inside: true },
                { x: -exports.INFINITY_RADIUS + outerRadiusFromRectangleWidth, y: 0, r: exports.INFINITY_RADIUS, inside: true },
                { x: 0, y: exports.INFINITY_RADIUS - outerRadiusFromRectanglHeight, r: exports.INFINITY_RADIUS, inside: true },
                { x: 0, y: -exports.INFINITY_RADIUS + outerRadiusFromRectanglHeight, r: exports.INFINITY_RADIUS, inside: true },
            ];
        return [...sectorCirclines, ...rectangleCirclines];
    };
}
exports.ringSectorConstruction = ringSectorConstruction;
function makeRowCircline(cx, cy, radialOffset, rotation, fontSize, offsetSign) {
    const r = exports.INFINITY_RADIUS;
    const offset = (offsetSign * fontSize) / 2;
    const topRadius = r - offset;
    const x = cx + topRadius * Math.cos(-rotation + constants_1.TAU / 4);
    const y = cy + topRadius * Math.cos(-rotation + constants_1.TAU / 2);
    return { r: r + radialOffset, x, y };
}
exports.makeRowCircline = makeRowCircline;
//# sourceMappingURL=circline_geometry.js.map