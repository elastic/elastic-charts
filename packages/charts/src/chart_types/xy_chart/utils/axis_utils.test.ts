/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getScaleForAxisSpec, isMultilayerTimeAxis, isXDomain } from './axis_utils';
import { MockGlobalSpec } from '../../../mocks/specs/specs';
import { MockXDomain, MockYDomain } from '../../../mocks/xy/domains';
import { ScaleType } from '../../../scales/constants';
import { Position } from '../../../utils/common';

const xDomain = MockXDomain.fromScaleType(ScaleType.Linear, {
  domain: [0, 1],
  isBandScale: false,
  minInterval: 0,
});
const yDomain = MockYDomain.fromScaleType(ScaleType.Linear, {
  groupId: 'group_1',
  domain: [0, 1],
  isBandScale: false,
});

describe('isXDomain', () => {
  test('horizontal axis at 0°/180° rotation is on the x domain', () => {
    expect(isXDomain(Position.Bottom, 0)).toBe(true);
    expect(isXDomain(Position.Top, 180)).toBe(true);
  });

  test('vertical axis at 0°/180° rotation is on the y domain', () => {
    expect(isXDomain(Position.Left, 0)).toBe(false);
    expect(isXDomain(Position.Right, 180)).toBe(false);
  });

  test('±90° rotation swaps the assignment: vertical axis becomes x, horizontal becomes y', () => {
    expect(isXDomain(Position.Left, 90)).toBe(true);
    expect(isXDomain(Position.Right, -90)).toBe(true);
    expect(isXDomain(Position.Bottom, 90)).toBe(false);
    expect(isXDomain(Position.Top, -90)).toBe(false);
  });
});

describe('getScaleForAxisSpec', () => {
  test('returns the y scale for a y-domain axis spec with a matching groupId', () => {
    const factory = getScaleForAxisSpec({ xDomain, yDomains: [yDomain] }, { rotation: 0 }, 0);
    const yAxisSpec = MockGlobalSpec.yAxis({ id: 'y', groupId: 'group_1', position: Position.Left });

    const scale = factory(yAxisSpec, [100, 0]);

    expect(scale).not.toBeNull();
    expect(scale?.domain).toEqual([0, 1]);
    expect(scale?.range).toEqual([100, 0]);
    expect(scale?.ticks()).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  test('returns null when the y axis groupId has no matching yDomain', () => {
    const factory = getScaleForAxisSpec({ xDomain, yDomains: [yDomain] }, { rotation: 0 }, 0);
    const yAxisSpec = MockGlobalSpec.yAxis({ id: 'y', groupId: 'missing', position: Position.Left });

    expect(factory(yAxisSpec, [100, 0])).toBeNull();
  });

  test('returns the x scale for a horizontal axis spec at the default rotation', () => {
    const factory = getScaleForAxisSpec({ xDomain, yDomains: [yDomain] }, { rotation: 0 }, 0);
    const xAxisSpec = MockGlobalSpec.xAxis({ id: 'x', position: Position.Bottom });

    const scale = factory(xAxisSpec, [0, 200]);

    expect(scale).not.toBeNull();
    expect(scale?.range).toEqual([0, 200]);
  });

  test('at rotation 90 a left-positioned spec is treated as x-domain and returns the x scale', () => {
    const factory = getScaleForAxisSpec({ xDomain, yDomains: [yDomain] }, { rotation: 90 }, 0);
    const verticalSpec = MockGlobalSpec.yAxis({ id: 'y', position: Position.Left });

    const scale = factory(verticalSpec, [0, 200]);

    expect(scale).not.toBeNull();
    expect(scale?.range).toEqual([0, 200]);
  });
});

describe('isMultilayerTimeAxis', () => {
  test('should return true if chartType is xy_axis, timeAxisLayerCount = 2, position is bottom, x axis type is time, rotation is 0', () => {
    const multilayerTimeAxis = isMultilayerTimeAxis(
      MockGlobalSpec.xAxis({ timeAxisLayerCount: 2, position: 'bottom' }),
      'time',
      0,
    );
    expect(multilayerTimeAxis).toBe(true);
  });

  test('should return false if x axis type is not time', () => {
    const multilayerTimeAxis = isMultilayerTimeAxis(
      MockGlobalSpec.xAxis({ timeAxisLayerCount: 2, position: 'bottom' }),
      'ordinal',
      0,
    );
    expect(multilayerTimeAxis).toBe(false);
  });

  test('should return false timeAxisLayerCount = 0', () => {
    const multilayerTimeAxis = isMultilayerTimeAxis(
      MockGlobalSpec.xAxis({ timeAxisLayerCount: 0, position: 'bottom' }),
      'time',
      0,
    );
    expect(multilayerTimeAxis).toBe(false);
  });
});
