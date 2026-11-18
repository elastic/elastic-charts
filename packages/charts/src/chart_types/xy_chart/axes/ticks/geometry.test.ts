/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTickLabelPosition } from './geometry';
import type { TickLabelBox } from './labels';
import { HorizontalAlignment, mergePartial, Position, VerticalAlignment } from '../../../../utils/common';
import { innerPad, type Size } from '../../../../utils/dimensions';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { AxisStyle, TextOffset } from '../../../../utils/themes/theme';

const AXIS_STYLE = LIGHT_THEME.axes;
const TICK_LINE_DIMENSION = AXIS_STYLE.tickLine.size + AXIS_STYLE.tickLine.padding;
const LABEL_INNER_PADDING = innerPad(AXIS_STYLE.tickLabel.padding);
const PADDED_TICK_DIMENSION = TICK_LINE_DIMENSION + LABEL_INNER_PADDING;

const styleWith = (overrides: Partial<AxisStyle['tickLabel']> = {}) =>
  mergePartial(AXIS_STYLE, { tickLabel: overrides });

const labelBox: TickLabelBox = {
  width: 40,
  height: 16,
  bboxWidth: 40,
  bboxHeight: 16,
  lines: Object.assign(['label'], { meta: { truncated: false } }),
};

const noOffset: TextOffset = { x: 0, y: 0, reference: 'local' };
const nearAlignment = { horizontal: HorizontalAlignment.Near, vertical: VerticalAlignment.Near };

describe('getTickLabelPosition', () => {
  describe('vertical axes', () => {
    const verticalSize: Size = { width: 100, height: 200 };
    const tickPosition = 80;

    test('left axis with "near" alignment places the bbox against the inner band edge', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Left,
        0,
        verticalSize,
        labelBox,
        true,
        noOffset,
        nearAlignment,
      );

      expect(props).toEqual({
        center: {
          x: verticalSize.width - PADDED_TICK_DIMENSION - labelBox.bboxWidth / 2,
          y: tickPosition,
        },
        textAlign: HorizontalAlignment.Right,
        horizontalAlign: HorizontalAlignment.Right,
        verticalAlign: VerticalAlignment.Middle,
      });
    });

    test('right axis with "near" alignment places the bbox against the inner band edge', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Right,
        0,
        verticalSize,
        labelBox,
        true,
        noOffset,
        nearAlignment,
      );

      expect(props).toEqual({
        center: {
          x: PADDED_TICK_DIMENSION + labelBox.bboxWidth / 2,
          y: tickPosition,
        },
        textAlign: HorizontalAlignment.Left,
        horizontalAlign: HorizontalAlignment.Left,
        verticalAlign: VerticalAlignment.Middle,
      });
    });
  });

  describe('horizontal axes', () => {
    const horizontalSize: Size = { width: 200, height: 100 };
    const tickPosition = 50;

    test('top axis with "near" alignment places the bboxes at the top of the axis band', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Top,
        0,
        horizontalSize,
        labelBox,
        true,
        noOffset,
        nearAlignment,
      );

      expect(props).toEqual({
        center: {
          x: tickPosition,
          y: horizontalSize.height - PADDED_TICK_DIMENSION - labelBox.bboxHeight / 2,
        },
        textAlign: HorizontalAlignment.Center,
        horizontalAlign: HorizontalAlignment.Center,
        verticalAlign: VerticalAlignment.Bottom,
      });
    });

    test('bottom axis with "near" alignment places the bboxes at the bottom of the axis band', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Bottom,
        0,
        horizontalSize,
        labelBox,
        true,
        noOffset,
        nearAlignment,
      );

      expect(props).toEqual({
        center: {
          x: tickPosition,
          y: PADDED_TICK_DIMENSION + labelBox.bboxHeight / 2,
        },
        textAlign: HorizontalAlignment.Center,
        horizontalAlign: HorizontalAlignment.Center,
        verticalAlign: VerticalAlignment.Top,
      });
    });

    test('rotated bottom axis at ±90° centers the bbox on the tick', () => {
      const size = { width: 200, height: 100 };

      for (const rotation of [90, -90]) {
        const props = getTickLabelPosition(
          styleWith({ rotation }),
          50,
          Position.Bottom,
          rotation,
          size,
          labelBox,
          true,
          noOffset,
          nearAlignment,
        );

        expect(props.horizontalAlign).toBe(HorizontalAlignment.Center);
        expect(props.verticalAlign).toBe(VerticalAlignment.Top);
      }
    });
  });

  test('explicit alignment overrides the position-based default', () => {
    const props = getTickLabelPosition(
      styleWith(),
      0,
      Position.Left,
      0,
      { width: 100, height: 100 },
      labelBox,
      true,
      noOffset,
      { horizontal: HorizontalAlignment.Center, vertical: VerticalAlignment.Top },
    );

    expect(props.horizontalAlign).toBe(HorizontalAlignment.Center);
    expect(props.verticalAlign).toBe(VerticalAlignment.Top);
  });

  test('hidden ticks remove the tick line + padding from the band edge', () => {
    const size = { width: 200, height: 100 };
    const visible = getTickLabelPosition(
      styleWith(),
      0,
      Position.Bottom,
      0,
      size,
      labelBox,
      true,
      noOffset,
      nearAlignment,
    );
    const hidden = getTickLabelPosition(
      styleWith(),
      0,
      Position.Bottom,
      0,
      size,
      labelBox,
      false,
      noOffset,
      nearAlignment,
    );

    const visibleTop = visible.center.y - labelBox.bboxHeight / 2;
    const hiddenTop = hidden.center.y - labelBox.bboxHeight / 2;
    expect(visibleTop).toBe(PADDED_TICK_DIMENSION);
    expect(hiddenTop).toBe(LABEL_INNER_PADDING);
    expect(visibleTop - hiddenTop).toBe(TICK_LINE_DIMENSION);
  });
});
