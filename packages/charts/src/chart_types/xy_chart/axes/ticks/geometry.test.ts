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
import type { Size } from '../../../../utils/dimensions';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { AxisStyle, TextOffset } from '../../../../utils/themes/theme';

const styleWith = (overrides: Partial<AxisStyle['tickLabel']> = {}): AxisStyle =>
  mergePartial(LIGHT_THEME.axes, { tickLabel: overrides });

const labelBox: TickLabelBox = {
  width: 40,
  height: 16,
  bboxWidth: 40,
  bboxHeight: 16,
  lines: Object.assign(['label'], { meta: { truncated: false } }),
};

const localOffset: TextOffset = { x: 0, y: 0, reference: 'local' };
const nearAlignment = { horizontal: HorizontalAlignment.Near, vertical: VerticalAlignment.Near };

// LIGHT_THEME defaults: tickLine.size=10, tickLine.padding=10, tickLabel.padding.inner=10
// → with showTicks=true: paddedTickDimension = 10 + 10 + 10 = 30
const PADDED_TICK_DIMENSION = 30;

describe('getTickLabelPosition', () => {
  describe('vertical axes', () => {
    const verticalSize: Size = { width: 100, height: 200 };
    const tickPosition = 80;

    test('left axis with `near` alignment anchors the label to the right of the axis band', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Left,
        0,
        verticalSize,
        labelBox,
        true,
        localOffset,
        nearAlignment,
      );
      expect(props).toEqual({
        x: verticalSize.width - PADDED_TICK_DIMENSION,
        y: tickPosition,
        textOffsetX: 0,
        textOffsetY: -labelBox.height / 2,
        textAlign: HorizontalAlignment.Right,
        horizontalAlign: HorizontalAlignment.Right,
        verticalAlign: VerticalAlignment.Middle,
      });
    });

    test('right axis with `near` alignment anchors the label to the left of the axis band', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Right,
        0,
        verticalSize,
        labelBox,
        true,
        localOffset,
        nearAlignment,
      );
      expect(props).toMatchObject({
        x: PADDED_TICK_DIMENSION,
        y: tickPosition,
        horizontalAlign: HorizontalAlignment.Left,
        verticalAlign: VerticalAlignment.Middle,
      });
    });
  });

  describe('horizontal axes', () => {
    const horizontalSize: Size = { width: 200, height: 100 };
    const tickPosition = 50;

    test('top axis with `near` alignment anchors the label above the axis band, bottom-aligned', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Top,
        0,
        horizontalSize,
        labelBox,
        true,
        localOffset,
        nearAlignment,
      );
      expect(props).toEqual({
        x: tickPosition,
        y: horizontalSize.height - PADDED_TICK_DIMENSION,
        textOffsetX: 0,
        textOffsetY: -labelBox.height,
        textAlign: HorizontalAlignment.Center,
        horizontalAlign: HorizontalAlignment.Center,
        verticalAlign: VerticalAlignment.Bottom,
      });
    });

    test('bottom axis with `near` alignment anchors the label below the axis band, top-aligned', () => {
      const props = getTickLabelPosition(
        styleWith(),
        tickPosition,
        Position.Bottom,
        0,
        horizontalSize,
        labelBox,
        true,
        localOffset,
        nearAlignment,
      );
      expect(props).toEqual({
        x: tickPosition,
        y: PADDED_TICK_DIMENSION,
        textOffsetX: 0,
        textOffsetY: 0,
        textAlign: HorizontalAlignment.Center,
        horizontalAlign: HorizontalAlignment.Center,
        verticalAlign: VerticalAlignment.Top,
      });
    });

    test('rotated bottom axis switches horizontal/vertical alignment based on rotation sign', () => {
      let props = getTickLabelPosition(
        styleWith({ rotation: 90 }),
        50,
        Position.Bottom,
        90,
        { width: 200, height: 100 },
        labelBox,
        true,
        localOffset,
        nearAlignment,
      );
      expect(props.horizontalAlign).toBe(HorizontalAlignment.Left);
      expect(props.verticalAlign).toBe(VerticalAlignment.Middle);

      props = getTickLabelPosition(
        styleWith({ rotation: -90 }),
        50,
        Position.Bottom,
        -90,
        { width: 200, height: 100 },
        labelBox,
        true,
        localOffset,
        nearAlignment,
      );
      expect(props.horizontalAlign).toBe(HorizontalAlignment.Right);
      expect(props.verticalAlign).toBe(VerticalAlignment.Middle);
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
      localOffset,
      { horizontal: HorizontalAlignment.Center, vertical: VerticalAlignment.Top },
    );
    expect(props.horizontalAlign).toBe(HorizontalAlignment.Center);
    expect(props.verticalAlign).toBe(VerticalAlignment.Top);
  });

  test('hidden ticks remove the tick line + padding from the anchor', () => {
    const visible = getTickLabelPosition(
      styleWith(),
      0,
      Position.Bottom,
      0,
      { width: 200, height: 100 },
      labelBox,
      true,
      localOffset,
      nearAlignment,
    );
    const hidden = getTickLabelPosition(
      styleWith(),
      0,
      Position.Bottom,
      0,
      { width: 200, height: 100 },
      labelBox,
      false,
      localOffset,
      nearAlignment,
    );

    // tickLine size + padding == 20, label inner padding stays
    expect(visible.y - hidden.y).toBe(20);
  });

  test('global text offset shifts the anchor; local offset moves text inside the box', () => {
    const globalProps = getTickLabelPosition(
      styleWith(),
      0,
      Position.Left,
      0,
      { width: 100, height: 100 },
      labelBox,
      true,
      { x: '50%', y: '25%', reference: 'global' },
      nearAlignment,
    );
    const localProps = getTickLabelPosition(
      styleWith(),
      0,
      Position.Left,
      0,
      { width: 100, height: 100 },
      labelBox,
      true,
      { x: '50%', y: '25%', reference: 'local' },
      nearAlignment,
    );

    // global: 50% of bboxWidth (40) added to x; nothing in textOffsetX
    expect(globalProps.x - (100 - PADDED_TICK_DIMENSION)).toBe(20);
    expect(globalProps.textOffsetX).toBe(0);

    // local: x stays at the anchor; textOffsetX gets 50% of label width (40)
    expect(localProps.x).toBe(100 - PADDED_TICK_DIMENSION);
    expect(localProps.textOffsetX).toBe(20);
  });
});
