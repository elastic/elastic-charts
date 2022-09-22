"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRowCircline = exports.ringSectorConstruction = exports.angleToCircline = exports.INFINITY_RADIUS = exports.conjunctiveConstraint = void 0;
var constants_1 = require("../../../../common/constants");
var geometry_1 = require("../../../../common/geometry");
function euclideanDistance(_a, _b) {
    var x1 = _a.x, y1 = _a.y;
    var x2 = _b.x, y2 = _b.y;
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
function fullyContained(c1, c2) {
    return euclideanDistance(c1, c2) + c2.r <= c1.r;
}
function noOverlap(c1, c2) {
    return euclideanDistance(c1, c2) >= c1.r + c2.r;
}
function circlineIntersect(c1, c2) {
    var d = Math.sqrt((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y));
    if (c1.r + c2.r >= d && d >= Math.abs(c1.r - c2.r)) {
        var a1 = d + c1.r + c2.r;
        var a2 = d + c1.r - c2.r;
        var a3 = d - c1.r + c2.r;
        var a4 = -d + c1.r + c2.r;
        var area = Math.sqrt(a1 * a2 * a3 * a4) / 4;
        var xAux1 = (c1.x + c2.x) / 2 + ((c2.x - c1.x) * (c1.r * c1.r - c2.r * c2.r)) / (2 * d * d);
        var xAux2 = (2 * (c1.y - c2.y) * area) / (d * d);
        var x1 = xAux1 + xAux2;
        var x2 = xAux1 - xAux2;
        var yAux1 = (c1.y + c2.y) / 2 + ((c2.y - c1.y) * (c1.r * c1.r - c2.r * c2.r)) / (2 * d * d);
        var yAux2 = (2 * (c1.x - c2.x) * area) / (d * d);
        var y1 = yAux1 - yAux2;
        var y2 = yAux1 + yAux2;
        return [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
        ];
    }
    return [];
}
function circlineValidSectors(refC, c) {
    var inside = refC.inside;
    var x = c.x, y = c.y, r = c.r, from = c.from, to = c.to;
    var fullContainment = fullyContained(refC, c);
    var fullyOutside = noOverlap(refC, c) || fullyContained(c, refC);
    if ((inside && fullContainment) || (!inside && fullyOutside)) {
        return [];
    }
    if ((inside && fullyOutside) || (!inside && fullContainment)) {
        return [c];
    }
    var circlineIntersections = circlineIntersect(refC, c);
    if (circlineIntersections.length !== 2)
        return [];
    var _a = __read(circlineIntersections, 2), p1 = _a[0], p2 = _a[1];
    var aPre1 = Math.atan2(p1.y - c.y, p1.x - c.x);
    var aPre2 = Math.atan2(p2.y - c.y, p2.x - c.x);
    var a1p = Math.max(from, Math.min(to, aPre1 < 0 ? aPre1 + constants_1.TAU : aPre1));
    var a2p = Math.max(from, Math.min(to, aPre2 < 0 ? aPre2 + constants_1.TAU : aPre2));
    var a1 = Math.min(a1p, a2p);
    var a2 = a1p === a2p ? constants_1.TAU : Math.max(a1p, a2p);
    var breakpoints = [from];
    if (from < a1 && a1 < to)
        breakpoints.push(a1);
    if (from < a2 && a2 < to)
        breakpoints.push(a2);
    breakpoints.push(to);
    var predicate = inside ? noOverlap : fullyContained;
    var result = [];
    for (var i = 0; i < breakpoints.length - 1; i++) {
        var from_1 = breakpoints[i];
        var to_1 = breakpoints[i + 1];
        var midAngle = (from_1 + to_1) / 2;
        var xx = x + r * Math.cos(midAngle);
        var yy = y + r * Math.sin(midAngle);
        if (predicate(refC, { x: xx, y: yy, r: 0 }))
            result.push({ x: x, y: y, r: r, from: from_1, to: to_1 });
    }
    return result;
}
function conjunctiveConstraint(constraints, c) {
    var valids = [c];
    for (var i = 0; i < constraints.length; i++) {
        var refC = constraints[i];
        var nextValids = [];
        for (var j = 0; j < valids.length; j++) {
            var cc = valids[j];
            var currentValids = circlineValidSectors(refC, cc);
            nextValids.push.apply(nextValids, __spreadArray([], __read(currentValids), false));
        }
        valids = nextValids;
    }
    return valids;
}
exports.conjunctiveConstraint = conjunctiveConstraint;
exports.INFINITY_RADIUS = 1e4;
function angleToCircline(midRadius, alpha, direction) {
    var sectorRadiusLineX = Math.cos(alpha) * midRadius;
    var sectorRadiusLineY = Math.sin(alpha) * midRadius;
    var normalAngle = alpha + (direction * Math.PI) / 2;
    var x = sectorRadiusLineX + exports.INFINITY_RADIUS * Math.cos(normalAngle);
    var y = sectorRadiusLineY + exports.INFINITY_RADIUS * Math.sin(normalAngle);
    return { x: x, y: y, r: exports.INFINITY_RADIUS, inside: false, from: 0, to: constants_1.TAU };
}
exports.angleToCircline = angleToCircline;
function ringSectorStartAngle(d) {
    return (0, geometry_1.trueBearingToStandardPositionAngle)(d.x0 + Math.max(0, d.x1 - d.x0 - constants_1.TAU / 2) / 2);
}
function ringSectorEndAngle(d) {
    return (0, geometry_1.trueBearingToStandardPositionAngle)(d.x1 - Math.max(0, d.x1 - d.x0 - constants_1.TAU / 2) / 2);
}
function ringSectorInnerRadius(innerRadius, ringThickness) {
    return function (d) { return innerRadius + d.y0 * ringThickness; };
}
function ringSectorOuterRadius(innerRadius, ringThickness) {
    return function (d) { return innerRadius + (d.y0 + 1) * ringThickness; };
}
function ringSectorConstruction(_a, _b, innerRadius, ringThickness) {
    var fillOutside = _a.fillOutside, radiusOutside = _a.radiusOutside, fillRectangleWidth = _a.fillRectangleWidth, fillRectangleHeight = _a.fillRectangleHeight;
    var circlePadding = _b.circlePadding, radialPadding = _b.radialPadding;
    return function (ringSector) {
        var radiusGetter = fillOutside ? ringSectorOuterRadius : ringSectorInnerRadius;
        var geometricInnerRadius = radiusGetter(innerRadius, ringThickness)(ringSector);
        var innerR = geometricInnerRadius + circlePadding * 2;
        var outerR = Math.max(innerR, ringSectorOuterRadius(innerRadius, ringThickness)(ringSector) - circlePadding + (fillOutside ? radiusOutside : 0));
        var startAngle = ringSectorStartAngle(ringSector);
        var endAngle = ringSectorEndAngle(ringSector);
        var innerCircline = { x: 0, y: 0, r: innerR, inside: true, from: 0, to: constants_1.TAU };
        var outerCircline = { x: 0, y: 0, r: outerR, inside: false, from: 0, to: constants_1.TAU };
        var midRadius = (innerR + outerR) / 2;
        var sectorStartCircle = angleToCircline(midRadius, startAngle - radialPadding, -1);
        var sectorEndCircle = angleToCircline(midRadius, endAngle + radialPadding, 1);
        var outerRadiusFromRectangleWidth = fillRectangleWidth / 2;
        var outerRadiusFromRectanglHeight = fillRectangleHeight / 2;
        var fullCircle = ringSector.x0 === 0 && ringSector.x1 === constants_1.TAU && geometricInnerRadius === 0;
        var sectorCirclines = __spreadArray(__spreadArray(__spreadArray([], __read((fullCircle && innerRadius === 0 ? [] : [innerCircline])), false), [
            outerCircline
        ], false), __read((fullCircle ? [] : [sectorStartCircle, sectorEndCircle])), false);
        var rectangleCirclines = outerRadiusFromRectangleWidth === Infinity && outerRadiusFromRectanglHeight === Infinity
            ? []
            : [
                { x: exports.INFINITY_RADIUS - outerRadiusFromRectangleWidth, y: 0, r: exports.INFINITY_RADIUS, inside: true },
                { x: -exports.INFINITY_RADIUS + outerRadiusFromRectangleWidth, y: 0, r: exports.INFINITY_RADIUS, inside: true },
                { x: 0, y: exports.INFINITY_RADIUS - outerRadiusFromRectanglHeight, r: exports.INFINITY_RADIUS, inside: true },
                { x: 0, y: -exports.INFINITY_RADIUS + outerRadiusFromRectanglHeight, r: exports.INFINITY_RADIUS, inside: true },
            ];
        return __spreadArray(__spreadArray([], __read(sectorCirclines), false), __read(rectangleCirclines), false);
    };
}
exports.ringSectorConstruction = ringSectorConstruction;
function makeRowCircline(cx, cy, radialOffset, rotation, fontSize, offsetSign) {
    var r = exports.INFINITY_RADIUS;
    var offset = (offsetSign * fontSize) / 2;
    var topRadius = r - offset;
    var x = cx + topRadius * Math.cos(-rotation + constants_1.TAU / 4);
    var y = cy + topRadius * Math.cos(-rotation + constants_1.TAU / 2);
    return { r: r + radialOffset, x: x, y: y };
}
exports.makeRowCircline = makeRowCircline;
//# sourceMappingURL=circline_geometry.js.map