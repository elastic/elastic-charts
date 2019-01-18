import { XDomain } from '../series/domains/x_domain';
import { YDomain } from '../series/domains/y_domain';
import { Position } from '../series/specs';
// import { ScalesConfig } from '../themes/theme';
import { getAxisId, getGroupId } from '../utils/ids';
import { ScaleType } from '../utils/scales/scales';
import {
  computeAxisTicksDimensions,
  computeRotatedLabelDimensions,
  getAvailableTicks,
  getMinMaxRange,
  getScaleForAxisSpec,
  getVisibleTicks,
  hasLabelOffset,
} from './axis_utils';
import { SvgTextBBoxCalculator } from './svg_text_bbox_calculator';

// const chartScalesConfig: ScalesConfig = {
//   ordinal: {
//     padding:  0,
//   },
// };
describe('Axis computational utils', () => {
  const mockedRect = {
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 10,
    height: 10,
    toJSON: () => '',
  };
  const originalGetBBox = SVGElement.prototype.getBoundingClientRect;
  beforeEach(
    () =>
      (SVGElement.prototype.getBoundingClientRect = function () {
        const text = this.textContent || 0;
        return { ...mockedRect, width: Number(text) * 10, heigh: Number(text) * 10 };
      }),
  );
  afterEach(() => (SVGElement.prototype.getBoundingClientRect = originalGetBBox));

  const chartDim = {
    width: 100,
    height: 100,
    top: 0,
    left: 0,
  };
  const axis1Dims = {
    axisScaleType: ScaleType.Linear,
    axisScaleDomain: [0, 1],
    tickValues: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    tickLabels: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'],
    maxTickWidth: 10,
    maxTickHeight: 10,
    maxTickLabelWidth: 10,
    maxTickLabelHeight: 10,
  };
  const verticalAxisSpec = {
    id: getAxisId('axis_1'),
    groupId: getGroupId('group_1'),
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Left,
    tickSize: 10,
    tickPadding: 10,
    tickFormat: (value: any) => {
      return `${value}`;
    },
  };

  const xDomain: XDomain = {
    type: 'xDomain',
    scaleType: ScaleType.Linear,
    domain: [0, 1],
    isBandScale: false,
    minInterval: 0,
  };

  const yDomain: YDomain = {
    scaleType: ScaleType.Linear,
    groupId: getGroupId('group_1'),
    type: 'yDomain',
    domain: [0, 1],
    isBandScale: false,
  };

  test('should compute axis dimensions', () => {
    const bboxCalculator = new SvgTextBBoxCalculator();
    const axisDimensions = computeAxisTicksDimensions(verticalAxisSpec, xDomain, [yDomain], 1, bboxCalculator, 0);
    expect(axisDimensions).toEqual(axis1Dims);
    bboxCalculator.destroy();
  });

  test('should compute dimensions for the bounding box containing a rotated label', () => {
    expect(computeRotatedLabelDimensions({ width: 1, height: 2 }, 0)).toEqual({ width: 1, height: 2 });

    const dims90 = computeRotatedLabelDimensions({ width: 1, height: 2 }, 90);
    expect(dims90.width).toBeCloseTo(2);
    expect(dims90.height).toBeCloseTo(1);

    const dims45 = computeRotatedLabelDimensions({ width: 1, height: 1 }, 45);
    expect(dims45.width).toBeCloseTo(Math.sqrt(2));
    expect(dims45.height).toBeCloseTo(Math.sqrt(2));
  });

  test('should determine if an axis label should have a position offset', () => {
    expect(hasLabelOffset(true, 0)).toBe(false);
    expect(hasLabelOffset(false, 0)).toBe(false);

    expect(hasLabelOffset(true, 270)).toBe(true);
    expect(hasLabelOffset(true, -90)).toBe(true);

    expect(hasLabelOffset(true, 90)).toBe(false);
    expect(hasLabelOffset(true, -270)).toBe(false);

    expect(hasLabelOffset(false, 270)).toBe(false);
    expect(hasLabelOffset(false, -90)).toBe(false);

    expect(hasLabelOffset(false, -270)).toBe(true);
    expect(hasLabelOffset(false, 90)).toBe(true);
  });

  test('should generate a valid scale', () => {
    const scale = getScaleForAxisSpec(verticalAxisSpec, xDomain, [yDomain], 0, 0, 0, 100);
    expect(scale).toBeDefined();
    expect(scale!.bandwidth).toBe(0);
    expect(scale!.domain).toEqual([0, 1]);
    expect(scale!.range).toEqual([100, 0]);
    expect(scale!.ticks()).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
  });

  test('should compute available ticks', () => {
    const scale = getScaleForAxisSpec(verticalAxisSpec, xDomain, [yDomain], 0, 0, 0, 100);
    const axisPositions = getAvailableTicks(verticalAxisSpec, scale!, 0);
    const expectedAxisPositions = [
      { label: '0', position: 100, value: 0 },
      { label: '0.1', position: 90, value: 0.1 },
      { label: '0.2', position: 80, value: 0.2 },
      { label: '0.3', position: 70, value: 0.3 },
      { label: '0.4', position: 60, value: 0.4 },
      { label: '0.5', position: 50, value: 0.5 },
      { label: '0.6', position: 40, value: 0.6 },
      { label: '0.7', position: 30, value: 0.7 },
      { label: '0.8', position: 20, value: 0.8 },
      { label: '0.9', position: 10, value: 0.9 },
      { label: '1', position: 0, value: 1 },
    ];
    expect(axisPositions).toEqual(expectedAxisPositions);
  });
  test('should compute visible ticks', () => {
    const allTicks = [
      { label: '0', position: 100, value: 0 },
      { label: '0.1', position: 90, value: 0.1 },
      { label: '0.2', position: 80, value: 0.2 },
      { label: '0.3', position: 70, value: 0.3 },
      { label: '0.4', position: 60, value: 0.4 },
      { label: '0.5', position: 50, value: 0.5 },
      { label: '0.6', position: 40, value: 0.6 },
      { label: '0.7', position: 30, value: 0.7 },
      { label: '0.8', position: 20, value: 0.8 },
      { label: '0.9', position: 10, value: 0.9 },
      { label: '1', position: 0, value: 1 },
    ];
    const visibleTicks = getVisibleTicks(allTicks, verticalAxisSpec, axis1Dims, chartDim, 0);
    const expectedVisibleTicks = [
      { label: '0', position: 100, value: 0 },
      { label: '0.1', position: 90, value: 0.1 },
      { label: '0.2', position: 80, value: 0.2 },
      { label: '0.3', position: 70, value: 0.3 },
      { label: '0.4', position: 60, value: 0.4 },
      { label: '0.5', position: 50, value: 0.5 },
      { label: '0.6', position: 40, value: 0.6 },
      { label: '0.7', position: 30, value: 0.7 },
      { label: '0.8', position: 20, value: 0.8 },
      { label: '0.9', position: 10, value: 0.9 },
      { label: '1', position: 0, value: 1 },
    ];
    expect(visibleTicks).toEqual(expectedVisibleTicks);
  });
  test('should hide some ticks', () => {
    const allTicks = [
      { label: '0', position: 100, value: 0 },
      { label: '0.1', position: 90, value: 0.1 },
      { label: '0.2', position: 80, value: 0.2 },
      { label: '0.3', position: 70, value: 0.3 },
      { label: '0.4', position: 60, value: 0.4 },
      { label: '0.5', position: 50, value: 0.5 },
      { label: '0.6', position: 40, value: 0.6 },
      { label: '0.7', position: 30, value: 0.7 },
      { label: '0.8', position: 20, value: 0.8 },
      { label: '0.9', position: 10, value: 0.9 },
      { label: '1', position: 0, value: 1 },
    ];
    const axis2Dims = {
      axisScaleType: ScaleType.Linear,
      axisScaleDomain: [0, 1],
      tickValues: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      tickLabels: ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'],
      maxTickWidth: 10,
      maxTickHeight: 20,
      maxTickLabelWidth: 10,
      maxTickLabelHeight: 20,
    };
    const visibleTicks = getVisibleTicks(allTicks, verticalAxisSpec, axis2Dims, chartDim, 0);
    const expectedVisibleTicks = [
      { label: '0', position: 100, value: 0 },
      { label: '0.2', position: 80, value: 0.2 },
      { label: '0.4', position: 60, value: 0.4 },
      { label: '0.6', position: 40, value: 0.6 },
      { label: '0.8', position: 20, value: 0.8 },
      { label: '1', position: 0, value: 1 },
    ];
    expect(visibleTicks).toEqual(expectedVisibleTicks);
  });
  test('should compute min max range for on 0 deg bottom', () => {
    const minMax = getMinMaxRange(Position.Bottom, 0, {
      width: 100,
      height: 50,
      top: 0,
      left: 0,
    });
    expect(minMax).toEqual({ minRange: 0, maxRange: 100 });
  });
  test('should compute min max range for on 90 deg Left', () => {
    const minMax = getMinMaxRange(Position.Left, 90, {
      width: 100,
      height: 50,
      top: 0,
      left: 0,
    });
    expect(minMax).toEqual({ minRange: 0, maxRange: 50 });
  });
  test('should compute min max range for on -90 deg Right', () => {
    const minMax = getMinMaxRange(Position.Bottom, -90, {
      width: 100,
      height: 50,
      top: 0,
      left: 0,
    });
    expect(minMax).toEqual({ minRange: 100, maxRange: 0 });
  });
  test('should compute min max range for on 180 deg bottom', () => {
    const minMax = getMinMaxRange(Position.Bottom, 180, {
      width: 100,
      height: 50,
      top: 0,
      left: 0,
    });
    expect(minMax).toEqual({ minRange: 100, maxRange: 0 });
  });
});
