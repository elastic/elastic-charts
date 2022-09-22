"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.geoms = exports.Text = exports.Arc = exports.initialBoundingBox = exports.Section = void 0;
var constants_1 = require("../../../../common/constants");
var text_utils_1 = require("../../../../common/text_utils");
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var constants_2 = require("../../specs/constants");
var utils_1 = require("./utils");
var Section = (function () {
    function Section(x, y, xTo, yTo, lineWidth, strokeStyle, capturePad) {
        this.x = x;
        this.y = y;
        this.xTo = xTo;
        this.yTo = yTo;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.capturePad = capturePad;
    }
    Section.prototype.boundingBoxes = function () {
        return this.lineWidth === 0
            ? []
            : [
                {
                    x0: Math.min(this.x, this.xTo) - this.lineWidth / 2 - this.capturePad,
                    y0: Math.min(this.y, this.yTo) - this.lineWidth / 2 - this.capturePad,
                    x1: Math.max(this.x, this.xTo) + this.lineWidth / 2 + this.capturePad,
                    y1: Math.max(this.y, this.yTo) + this.lineWidth / 2 + this.capturePad,
                },
            ];
    };
    Section.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.xTo, this.yTo);
        ctx.stroke();
    };
    return Section;
}());
exports.Section = Section;
var initialBoundingBox = function () { return ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }); };
exports.initialBoundingBox = initialBoundingBox;
var Arc = (function () {
    function Arc(x, y, radius, startAngle, endAngle, anticlockwise, lineWidth, strokeStyle, capturePad, arcBoxSamplePitch) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.anticlockwise = anticlockwise;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.capturePad = capturePad;
        this.arcBoxSamplePitch = arcBoxSamplePitch;
    }
    Arc.prototype.boundingBoxes = function () {
        if (this.lineWidth === 0)
            return [];
        var box = (0, exports.initialBoundingBox)();
        var rotationCount = Math.ceil(Math.max(0, -this.startAngle, -this.endAngle) / constants_1.TAU);
        var startAngle = this.startAngle + rotationCount * constants_1.TAU;
        var endAngle = this.endAngle + rotationCount * constants_1.TAU;
        var angleFrom = Math.round(startAngle / this.arcBoxSamplePitch) * this.arcBoxSamplePitch;
        var angleTo = Math.round(endAngle / this.arcBoxSamplePitch) * this.arcBoxSamplePitch;
        var signedIncrement = this.arcBoxSamplePitch * Math.sign(angleTo - angleFrom);
        for (var angle = angleFrom; angle <= angleTo; angle += signedIncrement) {
            var vx = Math.cos(angle);
            var vy = Math.sin(angle);
            var innerRadius = this.radius - this.lineWidth / 2;
            var outerRadius = this.radius + this.lineWidth / 2;
            var innerX = this.x + vx * innerRadius;
            var innerY = this.y + vy * innerRadius;
            var outerX = this.x + vx * outerRadius;
            var outerY = this.y + vy * outerRadius;
            box.x0 = Math.min(box.x0, innerX - this.capturePad, outerX - this.capturePad);
            box.y0 = Math.min(box.y0, innerY - this.capturePad, outerY - this.capturePad);
            box.x1 = Math.max(box.x1, innerX + this.capturePad, outerX + this.capturePad);
            box.y1 = Math.max(box.y1, innerY + this.capturePad, outerY + this.capturePad);
            if (signedIncrement === 0)
                break;
        }
        return Number.isFinite(box.x0) ? [box] : [];
    };
    Arc.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        ctx.stroke();
    };
    return Arc;
}());
exports.Arc = Arc;
var Text = (function () {
    function Text(x, y, text, textAlign, textBaseline, fontShape, fontSize, fillStyle, capturePad) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
        this.fontShape = fontShape;
        this.fontSize = fontSize;
        this.fillStyle = fillStyle;
        this.capturePad = capturePad;
    }
    Text.prototype.setCanvasTextState = function (ctx) {
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.font = (0, text_utils_1.cssFontShorthand)(this.fontShape, this.fontSize);
    };
    Text.prototype.boundingBoxes = function (ctx) {
        if (this.text.length === 0)
            return [];
        var box = (0, canvas_text_bbox_calculator_1.measureText)(ctx)(this.text, this.fontShape, this.fontSize);
        return [
            {
                x0: -box.width / 2 + this.x - this.capturePad,
                y0: -box.height / 2 + this.y - this.capturePad,
                x1: box.width / 2 + this.x + this.capturePad,
                y1: box.height / 2 + this.y + this.capturePad,
            },
        ];
    };
    Text.prototype.render = function (ctx) {
        this.setCanvasTextState(ctx);
        ctx.beginPath();
        ctx.fillStyle = this.fillStyle;
        ctx.fillText(this.text, this.x, this.y);
    };
    return Text;
}());
exports.Text = Text;
function get(o, name, dflt) {
    return name in o ? o[name] || dflt : dflt;
}
function geoms(bulletViewModel, theme, parentDimensions, chartCenter) {
    var subtype = bulletViewModel.subtype, lowestValue = bulletViewModel.lowestValue, highestValue = bulletViewModel.highestValue, base = bulletViewModel.base, target = bulletViewModel.target, actual = bulletViewModel.actual, bands = bulletViewModel.bands, ticks = bulletViewModel.ticks, labelMajor = bulletViewModel.labelMajor, labelMinor = bulletViewModel.labelMinor, centralMajor = bulletViewModel.centralMajor, centralMinor = bulletViewModel.centralMinor, angleEnd = bulletViewModel.angleEnd, angleStart = bulletViewModel.angleStart;
    var circular = subtype === constants_2.GoalSubtype.Goal;
    var vertical = subtype === constants_2.GoalSubtype.VerticalBullet;
    var domain = [lowestValue, highestValue];
    var data = __assign(__assign(__assign(__assign({ base: { value: base } }, Object.fromEntries(bands.map(function (_a, index) {
        var value = _a.value;
        return ["qualitative_".concat(index), { value: value }];
    }))), { target: { value: target }, actual: { value: actual }, yOffset: { value: 0 }, labelMajor: { value: domain[circular || !vertical ? 0 : 1], text: labelMajor }, labelMinor: { value: domain[circular || !vertical ? 0 : 1], text: labelMinor } }), Object.assign.apply(Object, __spreadArray([{}], __read(ticks.map(function (_a, i) {
        var _b;
        var value = _a.value, text = _a.text;
        return (_b = {}, _b["tick_".concat(i)] = { value: value, text: text }, _b);
    })), false))), (circular
        ? {
            centralMajor: { value: 0, text: centralMajor },
            centralMinor: { value: 0, text: centralMinor },
        }
        : {}));
    var minSize = Math.min(parentDimensions.width, parentDimensions.height);
    var referenceSize = Math.min(circular ? theme.maxCircularSize : theme.maxBulletSize, circular ? minSize : vertical ? parentDimensions.height : parentDimensions.width) *
        (1 - 2 * theme.marginRatio);
    var barThickness = Math.min(circular ? theme.baselineArcThickness : theme.baselineBarThickness, referenceSize * theme.barThicknessMinSizeRatio);
    var tickLength = barThickness * Math.pow(1 / constants_1.GOLDEN_RATIO, 3);
    var tickOffset = -tickLength / 2 - barThickness / 2;
    var tickFontSize = Math.min(theme.maxTickFontSize, referenceSize / 25);
    var labelFontSize = Math.min(theme.maxLabelFontSize, referenceSize / 18);
    var centralFontSize = Math.min(theme.maxCentralFontSize, referenceSize / 14);
    var shape = circular ? 'arc' : 'line';
    var abstractGeoms = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(bulletViewModel.bands.map(function (b, i) { return ({
        order: 0,
        landmarks: {
            from: i ? "qualitative_".concat(i - 1) : 'base',
            to: "qualitative_".concat(i),
            yOffset: 'yOffset',
        },
        aes: { shape: shape, fillColor: b.fillColor, lineWidth: barThickness },
    }); })), false), [
        {
            order: 1,
            landmarks: { from: 'base', to: 'actual', yOffset: 'yOffset' },
            aes: { shape: shape, fillColor: theme.progressLine.stroke, lineWidth: tickLength },
        }
    ], false), __read((target
        ? [
            {
                order: 2,
                landmarks: { at: 'target', yOffset: 'yOffset' },
                aes: { shape: shape, fillColor: theme.targetLine.stroke, lineWidth: barThickness / constants_1.GOLDEN_RATIO },
            },
        ]
        : [])), false), __read(bulletViewModel.ticks.map(function (b, i) { return ({
        order: 3,
        landmarks: { at: "tick_".concat(i), yOffset: 'yOffset' },
        aes: { shape: shape, fillColor: theme.tickLine.stroke, lineWidth: tickLength, axisNormalOffset: tickOffset },
    }); })), false), __read(bulletViewModel.ticks.map(function (b, i) { return ({
        order: 4,
        landmarks: { at: "tick_".concat(i), yOffset: 'yOffset' },
        aes: {
            shape: 'text',
            textAlign: vertical ? 'right' : 'center',
            textBaseline: vertical ? 'middle' : 'top',
            fillColor: theme.tickLabel.fill,
            fontShape: __assign(__assign({}, theme.tickLabel), { fontVariant: 'normal', fontWeight: '500' }),
            axisNormalOffset: -barThickness,
        },
    }); })), false), [
        {
            order: 5,
            landmarks: { at: 'labelMajor' },
            aes: {
                shape: 'text',
                axisNormalOffset: 0,
                axisTangentOffset: circular || !vertical ? 0 : 2 * labelFontSize,
                textAlign: vertical ? 'center' : 'right',
                textBaseline: 'bottom',
                fillColor: theme.majorLabel.fill,
                fontShape: __assign(__assign({}, theme.majorLabel), { fontVariant: 'normal', fontWeight: '900' }),
            },
        },
        {
            order: 5,
            landmarks: { at: 'labelMinor' },
            aes: {
                shape: 'text',
                axisNormalOffset: 0,
                axisTangentOffset: circular || !vertical ? 0 : 2 * labelFontSize,
                textAlign: vertical ? 'center' : 'right',
                textBaseline: 'top',
                fillColor: theme.minorLabel.fill,
                fontShape: __assign(__assign({}, theme.minorLabel), { fontVariant: 'normal', fontWeight: '300' }),
            },
        }
    ], false), __read((circular
        ? [
            {
                order: 6,
                landmarks: { at: 'centralMajor', yOffset: 'yOffset' },
                aes: {
                    shape: 'text',
                    textAlign: 'center',
                    textBaseline: 'bottom',
                    fillColor: theme.majorCenterLabel.fill,
                    fontShape: __assign(__assign({}, theme.majorCenterLabel), { fontVariant: 'normal', fontWeight: '900' }),
                },
            },
            {
                order: 6,
                landmarks: { at: 'centralMinor', yOffset: 'yOffset' },
                aes: {
                    shape: 'text',
                    textAlign: 'center',
                    textBaseline: 'top',
                    fillColor: theme.minorCenterLabel.fill,
                    fontShape: __assign(__assign({}, theme.minorCenterLabel), { fontVariant: 'normal', fontWeight: '300' }),
                },
            },
        ]
        : [])), false);
    var maxWidth = abstractGeoms.reduce(function (p, g) { return Math.max(p, get(g.aes, 'lineWidth', 0)); }, 0);
    var r = 0.5 * referenceSize - maxWidth / 2;
    if (circular) {
        var sagitta = (0, utils_1.getMinSagitta)(angleStart, angleEnd, r);
        var maxSagitta = (0, utils_1.getSagitta)((3 / 2) * Math.PI, r);
        var direction = (0, utils_1.getTranformDirection)(angleStart, angleEnd);
        data.yOffset.value = Math.abs(sagitta) >= maxSagitta ? 0 : (direction * (maxSagitta - sagitta)) / 2;
    }
    var fullSize = referenceSize;
    var labelSize = fullSize / 2;
    var pxRangeFrom = -fullSize / 2 + (circular || vertical ? 0 : labelSize);
    var pxRangeTo = fullSize / 2 + (!circular && vertical ? -2 * labelFontSize : 0);
    var pxRangeMid = (pxRangeFrom + pxRangeTo) / 2;
    var pxRange = pxRangeTo - pxRangeFrom;
    var domainExtent = domain[1] - domain[0];
    var linearScale = function (x) { return pxRangeFrom + (pxRange * (x - domain[0])) / domainExtent; };
    var angleRange = angleEnd - angleStart;
    var angleScale = function (x) { return angleStart + (angleRange * (x - domain[0])) / domainExtent; };
    var clockwise = angleStart > angleEnd;
    return __spreadArray([], __read(abstractGeoms), false).sort(function (a, b) { return a.order - b.order; })
        .map(function (_a) {
        var _b, _c;
        var landmarks = _a.landmarks, aes = _a.aes;
        var at = get(landmarks, 'at', '');
        var from = get(landmarks, 'from', '');
        var to = get(landmarks, 'to', '');
        var yOffset = get(landmarks, 'yOffset', '');
        var textAlign = circular ? 'center' : get(aes, 'textAlign', '');
        var fontShape = get(aes, 'fontShape', '');
        var axisNormalOffset = get(aes, 'axisNormalOffset', 0);
        var axisTangentOffset = get(aes, 'axisTangentOffset', 0);
        var lineWidth = get(aes, 'lineWidth', 0);
        var yOffsetValue = (_c = (_b = data[yOffset]) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 0;
        var strokeStyle = get(aes, 'fillColor', '');
        if (aes.shape === 'text') {
            var text = data[at].text;
            var label = at.slice(0, 5) === 'label';
            var central = at.slice(0, 7) === 'central';
            var textBaseline = label || central || !circular ? get(aes, 'textBaseline', '') : 'middle';
            var fontSize = circular && label ? labelFontSize : circular && central ? centralFontSize : tickFontSize;
            var scaledValue = circular ? angleScale(data[at].value) : data[at] && linearScale(data[at].value);
            var x = circular
                ? (label || central ? 0 : (r - constants_1.GOLDEN_RATIO * barThickness) * Math.cos(scaledValue))
                : (vertical ? axisNormalOffset : axisTangentOffset + scaledValue);
            var y = circular
                ? (label ? r : central ? 0 : -(r - constants_1.GOLDEN_RATIO * barThickness) * Math.sin(scaledValue))
                : (vertical ? -axisTangentOffset - scaledValue : -axisNormalOffset);
            return new Text(x + chartCenter.x, y + chartCenter.y + yOffsetValue, text, textAlign, textBaseline, fontShape, fontSize, strokeStyle, theme.capturePad);
        }
        else if (aes.shape === 'arc') {
            var cx = chartCenter.x + pxRangeMid;
            var cy = chartCenter.y + yOffsetValue;
            var radius = at ? r + axisNormalOffset : r;
            var startAngle = at ? angleScale(data[at].value) + Math.PI / 360 : angleScale(data[from].value);
            var endAngle = at ? angleScale(data[at].value) - Math.PI / 360 : angleScale(data[to].value);
            var anticlockwise = at || clockwise === (data[from].value < data[to].value);
            return new Arc(cx, cy, radius, -startAngle, -endAngle, !anticlockwise, lineWidth, strokeStyle, theme.capturePad, theme.arcBoxSamplePitch);
        }
        else {
            var translateX = chartCenter.x + (vertical ? axisNormalOffset : axisTangentOffset);
            var translateY = chartCenter.y - (vertical ? axisTangentOffset : axisNormalOffset) + yOffsetValue;
            var atPx = data[at] && linearScale(data[at].value);
            var fromPx = at ? atPx - 1 : linearScale(data[from].value);
            var toPx = at ? atPx + 1 : linearScale(data[to].value);
            var x0 = vertical ? translateX : translateX + fromPx;
            var y0 = vertical ? translateY - fromPx : translateY;
            var x1 = vertical ? translateX : translateX + toPx;
            var y1 = vertical ? translateY - toPx : translateY;
            return new Section(x0, y0, x1, y1, lineWidth, strokeStyle, theme.capturePad);
        }
    });
}
exports.geoms = geoms;
//# sourceMappingURL=geoms.js.map