"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoms = exports.Text = exports.Arc = exports.initialBoundingBox = exports.Section = void 0;
const utils_1 = require("./utils");
const constants_1 = require("../../../../common/constants");
const text_utils_1 = require("../../../../common/text_utils");
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const constants_2 = require("../../specs/constants");
class Section {
    constructor(x, y, xTo, yTo, lineWidth, strokeStyle, capturePad) {
        this.x = x;
        this.y = y;
        this.xTo = xTo;
        this.yTo = yTo;
        this.lineWidth = lineWidth;
        this.strokeStyle = strokeStyle;
        this.capturePad = capturePad;
    }
    boundingBoxes() {
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
    }
    render(ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.xTo, this.yTo);
        ctx.stroke();
    }
}
exports.Section = Section;
const initialBoundingBox = () => ({ x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
exports.initialBoundingBox = initialBoundingBox;
class Arc {
    constructor(x, y, radius, startAngle, endAngle, anticlockwise, lineWidth, strokeStyle, capturePad, arcBoxSamplePitch) {
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
    boundingBoxes() {
        if (this.lineWidth === 0)
            return [];
        const box = (0, exports.initialBoundingBox)();
        const rotationCount = Math.ceil(Math.max(0, -this.startAngle, -this.endAngle) / constants_1.TAU);
        const startAngle = this.startAngle + rotationCount * constants_1.TAU;
        const endAngle = this.endAngle + rotationCount * constants_1.TAU;
        const angleFrom = Math.round(startAngle / this.arcBoxSamplePitch) * this.arcBoxSamplePitch;
        const angleTo = Math.round(endAngle / this.arcBoxSamplePitch) * this.arcBoxSamplePitch;
        const signedIncrement = this.arcBoxSamplePitch * Math.sign(angleTo - angleFrom);
        for (let angle = angleFrom; angle <= angleTo; angle += signedIncrement) {
            const vx = Math.cos(angle);
            const vy = Math.sin(angle);
            const innerRadius = this.radius - this.lineWidth / 2;
            const outerRadius = this.radius + this.lineWidth / 2;
            const innerX = this.x + vx * innerRadius;
            const innerY = this.y + vy * innerRadius;
            const outerX = this.x + vx * outerRadius;
            const outerY = this.y + vy * outerRadius;
            box.x0 = Math.min(box.x0, innerX - this.capturePad, outerX - this.capturePad);
            box.y0 = Math.min(box.y0, innerY - this.capturePad, outerY - this.capturePad);
            box.x1 = Math.max(box.x1, innerX + this.capturePad, outerX + this.capturePad);
            box.y1 = Math.max(box.y1, innerY + this.capturePad, outerY + this.capturePad);
            if (signedIncrement === 0)
                break;
        }
        return Number.isFinite(box.x0) ? [box] : [];
    }
    render(ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        ctx.stroke();
    }
}
exports.Arc = Arc;
class Text {
    constructor(x, y, text, textAlign, textBaseline, fontShape, fontSize, fillStyle, capturePad) {
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
    setCanvasTextState(ctx) {
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.font = (0, text_utils_1.cssFontShorthand)(this.fontShape, this.fontSize);
    }
    boundingBoxes(ctx) {
        if (this.text.length === 0)
            return [];
        const box = (0, canvas_text_bbox_calculator_1.measureText)(ctx)(this.text, this.fontShape, this.fontSize);
        return [
            {
                x0: -box.width / 2 + this.x - this.capturePad,
                y0: -box.height / 2 + this.y - this.capturePad,
                x1: box.width / 2 + this.x + this.capturePad,
                y1: box.height / 2 + this.y + this.capturePad,
            },
        ];
    }
    render(ctx) {
        this.setCanvasTextState(ctx);
        ctx.beginPath();
        ctx.fillStyle = this.fillStyle;
        ctx.fillText(this.text, this.x, this.y);
    }
}
exports.Text = Text;
function get(o, name, dflt) {
    return name in o ? o[name] || dflt : dflt;
}
function geoms(bulletViewModel, theme, parentDimensions, chartCenter) {
    const { subtype, lowestValue, highestValue, base, target, actual, bands, ticks, labelMajor, labelMinor, centralMajor, centralMinor, angleEnd, angleStart, } = bulletViewModel;
    const circular = subtype === constants_2.GoalSubtype.Goal;
    const vertical = subtype === constants_2.GoalSubtype.VerticalBullet;
    const domain = [lowestValue, highestValue];
    const data = {
        base: { value: base },
        ...Object.fromEntries(bands.map(({ value }, index) => [`qualitative_${index}`, { value }])),
        target: { value: target },
        actual: { value: actual },
        yOffset: { value: 0 },
        labelMajor: { value: domain[circular || !vertical ? 0 : 1], text: labelMajor },
        labelMinor: { value: domain[circular || !vertical ? 0 : 1], text: labelMinor },
        ...Object.assign({}, ...ticks.map(({ value, text }, i) => ({ [`tick_${i}`]: { value, text } }))),
        ...(circular
            ? {
                centralMajor: { value: 0, text: centralMajor },
                centralMinor: { value: 0, text: centralMinor },
            }
            : {}),
    };
    const minSize = Math.min(parentDimensions.width, parentDimensions.height);
    const referenceSize = Math.min(circular ? theme.maxCircularSize : theme.maxBulletSize, circular ? minSize : vertical ? parentDimensions.height : parentDimensions.width) *
        (1 - 2 * theme.marginRatio);
    const barThickness = Math.min(circular ? theme.baselineArcThickness : theme.baselineBarThickness, referenceSize * theme.barThicknessMinSizeRatio);
    const tickLength = barThickness * Math.pow(1 / constants_1.GOLDEN_RATIO, 3);
    const tickOffset = -tickLength / 2 - barThickness / 2;
    const tickFontSize = Math.min(theme.maxTickFontSize, referenceSize / 25);
    const labelFontSize = Math.min(theme.maxLabelFontSize, referenceSize / 18);
    const centralFontSize = Math.min(theme.maxCentralFontSize, referenceSize / 14);
    const shape = circular ? 'arc' : 'line';
    const abstractGeoms = [
        ...bulletViewModel.bands.map((b, i) => ({
            order: 0,
            landmarks: {
                from: i ? `qualitative_${i - 1}` : 'base',
                to: `qualitative_${i}`,
                yOffset: 'yOffset',
            },
            aes: { shape, fillColor: b.fillColor, lineWidth: barThickness },
        })),
        {
            order: 1,
            landmarks: { from: 'base', to: 'actual', yOffset: 'yOffset' },
            aes: { shape, fillColor: theme.progressLine.stroke, lineWidth: tickLength },
        },
        ...(target
            ? [
                {
                    order: 2,
                    landmarks: { at: 'target', yOffset: 'yOffset' },
                    aes: { shape, fillColor: theme.targetLine.stroke, lineWidth: barThickness / constants_1.GOLDEN_RATIO },
                },
            ]
            : []),
        ...bulletViewModel.ticks.map((b, i) => ({
            order: 3,
            landmarks: { at: `tick_${i}`, yOffset: 'yOffset' },
            aes: { shape, fillColor: theme.tickLine.stroke, lineWidth: tickLength, axisNormalOffset: tickOffset },
        })),
        ...bulletViewModel.ticks.map((b, i) => ({
            order: 4,
            landmarks: { at: `tick_${i}`, yOffset: 'yOffset' },
            aes: {
                shape: 'text',
                textAlign: vertical ? 'right' : 'center',
                textBaseline: vertical ? 'middle' : 'top',
                fillColor: theme.tickLabel.fill,
                fontShape: { ...theme.tickLabel, fontVariant: 'normal', fontWeight: '500' },
                axisNormalOffset: -barThickness,
            },
        })),
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
                fontShape: { ...theme.majorLabel, fontVariant: 'normal', fontWeight: '900' },
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
                fontShape: { ...theme.minorLabel, fontVariant: 'normal', fontWeight: '300' },
            },
        },
        ...(circular
            ? [
                {
                    order: 6,
                    landmarks: { at: 'centralMajor', yOffset: 'yOffset' },
                    aes: {
                        shape: 'text',
                        textAlign: 'center',
                        textBaseline: 'bottom',
                        fillColor: theme.majorCenterLabel.fill,
                        fontShape: { ...theme.majorCenterLabel, fontVariant: 'normal', fontWeight: '900' },
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
                        fontShape: { ...theme.minorCenterLabel, fontVariant: 'normal', fontWeight: '300' },
                    },
                },
            ]
            : []),
    ];
    const maxWidth = abstractGeoms.reduce((p, g) => Math.max(p, get(g.aes, 'lineWidth', 0)), 0);
    const r = 0.5 * referenceSize - maxWidth / 2;
    if (circular) {
        const sagitta = (0, utils_1.getMinSagitta)(angleStart, angleEnd, r);
        const maxSagitta = (0, utils_1.getSagitta)((3 / 2) * Math.PI, r);
        const direction = (0, utils_1.getTransformDirection)(angleStart, angleEnd);
        data.yOffset.value = Math.abs(sagitta) >= maxSagitta ? 0 : (direction * (maxSagitta - sagitta)) / 2;
    }
    const fullSize = referenceSize;
    const labelSize = fullSize / 2;
    const pxRangeFrom = -fullSize / 2 + (circular || vertical ? 0 : labelSize);
    const pxRangeTo = fullSize / 2 + (!circular && vertical ? -2 * labelFontSize : 0);
    const pxRangeMid = (pxRangeFrom + pxRangeTo) / 2;
    const pxRange = pxRangeTo - pxRangeFrom;
    const domainExtent = domain[1] - domain[0];
    const linearScale = (x) => pxRangeFrom + (pxRange * (x - domain[0])) / domainExtent;
    const angleRange = angleEnd - angleStart;
    const angleScale = (x) => angleStart + (angleRange * (x - domain[0])) / domainExtent;
    const clockwise = angleStart > angleEnd;
    return [...abstractGeoms]
        .sort((a, b) => a.order - b.order)
        .map(({ landmarks, aes }) => {
        var _a, _b;
        const at = get(landmarks, 'at', '');
        const from = get(landmarks, 'from', '');
        const to = get(landmarks, 'to', '');
        const yOffset = get(landmarks, 'yOffset', '');
        const textAlign = circular ? 'center' : get(aes, 'textAlign', '');
        const fontShape = get(aes, 'fontShape', '');
        const axisNormalOffset = get(aes, 'axisNormalOffset', 0);
        const axisTangentOffset = get(aes, 'axisTangentOffset', 0);
        const lineWidth = get(aes, 'lineWidth', 0);
        const yOffsetValue = (_b = (_a = data[yOffset]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0;
        const strokeStyle = get(aes, 'fillColor', '');
        if (aes.shape === 'text') {
            const { text } = data[at];
            const label = at.slice(0, 5) === 'label';
            const central = at.slice(0, 7) === 'central';
            const textBaseline = label || central || !circular ? get(aes, 'textBaseline', '') : 'middle';
            const fontSize = circular && label ? labelFontSize : circular && central ? centralFontSize : tickFontSize;
            const scaledValue = circular ? angleScale(data[at].value) : data[at] && linearScale(data[at].value);
            const x = circular
                ? (label || central ? 0 : (r - constants_1.GOLDEN_RATIO * barThickness) * Math.cos(scaledValue))
                : (vertical ? axisNormalOffset : axisTangentOffset + scaledValue);
            const y = circular
                ? (label ? r : central ? 0 : -(r - constants_1.GOLDEN_RATIO * barThickness) * Math.sin(scaledValue))
                : (vertical ? -axisTangentOffset - scaledValue : -axisNormalOffset);
            return new Text(x + chartCenter.x, y + chartCenter.y + yOffsetValue, text, textAlign, textBaseline, fontShape, fontSize, strokeStyle, theme.capturePad);
        }
        else if (aes.shape === 'arc') {
            const cx = chartCenter.x + pxRangeMid;
            const cy = chartCenter.y + yOffsetValue;
            const radius = at ? r + axisNormalOffset : r;
            const startAngle = at ? angleScale(data[at].value) + Math.PI / 360 : angleScale(data[from].value);
            const endAngle = at ? angleScale(data[at].value) - Math.PI / 360 : angleScale(data[to].value);
            const anticlockwise = at || clockwise === (data[from].value < data[to].value);
            return new Arc(cx, cy, radius, -startAngle, -endAngle, !anticlockwise, lineWidth, strokeStyle, theme.capturePad, theme.arcBoxSamplePitch);
        }
        else {
            const translateX = chartCenter.x + (vertical ? axisNormalOffset : axisTangentOffset);
            const translateY = chartCenter.y - (vertical ? axisTangentOffset : axisNormalOffset) + yOffsetValue;
            const atPx = data[at] && linearScale(data[at].value);
            const fromPx = at ? atPx - 1 : linearScale(data[from].value);
            const toPx = at ? atPx + 1 : linearScale(data[to].value);
            const x0 = vertical ? translateX : translateX + fromPx;
            const y0 = vertical ? translateY - fromPx : translateY;
            const x1 = vertical ? translateX : translateX + toPx;
            const y1 = vertical ? translateY - toPx : translateY;
            return new Section(x0, y0, x1, y1, lineWidth, strokeStyle, theme.capturePad);
        }
    });
}
exports.geoms = geoms;
//# sourceMappingURL=geoms.js.map