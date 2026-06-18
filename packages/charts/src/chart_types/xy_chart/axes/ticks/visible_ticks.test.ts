/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';
import moment from 'moment-timezone';

import type { TickLabelBox, TickLabelLayout } from './labels';
import { generateTicks, getVisibleTicks } from './visible_ticks';
import { MockGlobalSpec } from '../../../../mocks/specs/specs';
import { MockXDomain } from '../../../../mocks/xy/domains';
import { ScaleType } from '../../../../scales/constants';
import { Position } from '../../../../utils/common';
import { niceTimeFormatter } from '../../../../utils/data/formatters';
import { computeXScale } from '../../utils/scales';

const layoutFor =
  (size: { width?: number; height?: number } = {}) =>
  (label: string): TickLabelBox => {
    const width = size.width ?? label.length;
    const height = size.height ?? 10;
    return {
      width,
      height,
      bboxWidth: width,
      bboxHeight: height,
      lines: Object.assign([label], { meta: { truncated: false } }),
    };
  };
const layoutTickLabel: TickLabelLayout = layoutFor();

const linearScale = () => {
  const xDomain = MockXDomain.fromScaleType(ScaleType.Linear, {
    domain: [0, 100],
    isBandScale: false,
  });
  return computeXScale({ xDomain, totalBarsInCluster: 0, range: [0, 200] });
};

describe('generateTicks', () => {
  test('skips NaN tick values', () => {
    const xDomain = MockXDomain.fromScaleType(ScaleType.Ordinal, { domain: [1, 3, 5] });
    const scale = computeXScale({ xDomain, totalBarsInCluster: 0, range: [0, 10] });
    const result = generateTicks(scale, [1, 2, 3, 4, 5], 0, layoutTickLabel, String, undefined, 0, true, false);

    expect(result).toHaveLength(3);
    expect(result.map((tick) => tick.value)).toEqual([1, 3, 5]);
  });

  test('formats time-scale ticks using the provided formatter and time zone', () => {
    const start = DateTime.fromISO('2026-06-01T00:11:00.000', { zone: 'utc' }).toMillis();
    const end = DateTime.fromISO('2026-06-01T04:11:00.000', { zone: 'utc' }).toMillis();

    const xDomain = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [start, end],
      minInterval: moment.duration(30, 'minutes').asMilliseconds(),
    });

    const scale = computeXScale({ xDomain, totalBarsInCluster: 0, range: [0, 600] });
    const formatter = niceTimeFormatter([start, end]);

    const result = generateTicks(
      scale,
      scale.ticks(),
      0,
      layoutTickLabel,
      (value) => formatter(value, { timeZone: 'utc' }),
      undefined,
      0,
      true,
      false,
    );

    expect(result.map((tick) => tick.label)).toEqual([
      '00:30:00',
      '01:00:00',
      '01:30:00',
      '02:00:00',
      '02:30:00',
      '03:00:00',
      '03:30:00',
      '04:00:00',
    ]);
  });

  test('omits the first tick on the first layer when offset before the domain start', () => {
    // Mirrors the multilayer time axis case that the rule was introduced to fix (see PR #2681):
    // domain starts mid-bin (00:11) on a 30-min grid, but the raster proposes a 00:00 tick aligned
    // to the natural hour boundary. That tick is positioned before domain[0] and should be hidden
    // on the granular layer (layer 0) and kept on coarser layers.
    const start = DateTime.fromISO('2019-01-11T00:11:00.000', { zone: 'utc' }).toMillis();
    const end = DateTime.fromISO('2019-01-11T04:11:00.000', { zone: 'utc' }).toMillis();
    const offDomainTick = DateTime.fromISO('2019-01-11T00:00:00.000', { zone: 'utc' }).toMillis();
    const formatter = niceTimeFormatter([start, end]);
    const xDomain = MockXDomain.fromScaleType(ScaleType.Time, {
      isBandScale: false,
      domain: [start, end],
      minInterval: moment.duration(30, 'minutes').asMilliseconds(),
    });
    const scale = computeXScale({ xDomain, totalBarsInCluster: 0, range: [0, 603.5] });
    const formatTickLabel = (value: unknown) => formatter(value as number, { timeZone: 'utc' });
    const ticks = [offDomainTick, ...scale.ticks()];

    const dropped = generateTicks(scale, ticks, 0, layoutTickLabel, formatTickLabel, 0, 0, true, false);
    const kept = generateTicks(scale, ticks, 0, layoutTickLabel, formatTickLabel, 1, 0, true, false);

    expect(dropped.map((tick) => tick.label)).toEqual([
      '00:30:00',
      '01:00:00',
      '01:30:00',
      '02:00:00',
      '02:30:00',
      '03:00:00',
      '03:30:00',
      '04:00:00',
    ]);

    expect(kept).toHaveLength(9);
    expect(kept[0]?.label).toBe('00:00:00');
    expect(kept[0]?.domainClampedValue).toBe(start);
  });
});

describe('getVisibleTicks', () => {
  const ticks = [0, 25, 50, 75, 100];

  test('computes visible ticks for a vertical axis', () => {
    const axisSpec = MockGlobalSpec.yAxis({ id: 'y', position: Position.Left });
    const result = getVisibleTicks(
      axisSpec,
      layoutFor({ height: 10 }),
      String,
      0,
      0,
      linearScale(),
      false,
      0,
      0,
      ticks,
      false,
      0,
    );

    expect(result.map((tick) => tick.label)).toEqual(['0', '25', '50', '75', '100']);
    expect(result.map((tick) => tick.position)).toEqual([0, 50, 100, 150, 200]);
  });

  test('computes visible ticks for a horizontal axis', () => {
    const axisSpec = MockGlobalSpec.xAxis({ id: 'x', position: Position.Bottom });
    const result = getVisibleTicks(
      axisSpec,
      layoutFor({ width: 10 }),
      String,
      0,
      0,
      linearScale(),
      false,
      0,
      0,
      ticks,
      false,
      0,
    );

    expect(result.map((tick) => tick.label)).toEqual(['0', '25', '50', '75', '100']);
    expect(result.map((tick) => tick.position)).toEqual([0, 50, 100, 150, 200]);
  });

  test('drops overlapping ticks when neither showOverlappingTicks nor adaptiveTickCount are set', () => {
    const axisSpec = MockGlobalSpec.yAxis({ id: 'y', position: Position.Left });
    const result = getVisibleTicks(
      axisSpec,
      layoutFor({ height: 80 }),
      String,
      0,
      0,
      linearScale(),
      false,
      0,
      0,
      ticks,
      false,
      0,
    );

    expect(result.map((tick) => tick.label)).toEqual(['0', '50', '100']);
  });

  test('preserves every overlapping tick and label when showOverlappingLabels is set', () => {
    const axisSpec = MockGlobalSpec.yAxis({
      id: 'y',
      position: Position.Left,
      showOverlappingLabels: true,
    });
    const result = getVisibleTicks(
      axisSpec,
      layoutFor({ height: 80 }),
      String,
      0,
      0,
      linearScale(),
      false,
      0,
      0,
      ticks,
      false,
      0,
    );

    expect(result.map((tick) => tick.label)).toEqual(['0', '25', '50', '75', '100']);
  });
});
