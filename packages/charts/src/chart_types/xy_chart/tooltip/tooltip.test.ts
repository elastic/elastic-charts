/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { formatTooltipHeader, formatTooltipValue } from './tooltip';
import { ChartType } from '../..';
import { MockBarGeometry } from '../../../mocks';
import { MockGlobalSpec, MockSeriesSpec } from '../../../mocks/specs';
import { ScaleType } from '../../../scales/constants';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { RecursivePartial } from '../../../utils/common';
import { Position } from '../../../utils/common';
import type { BarGeometry } from '../../../utils/geometry';
import type { AxisStyle } from '../../../utils/themes/theme';
import type { AxisSpec, BarSeriesSpec, TickFormatter } from '../utils/specs';

const style: RecursivePartial<AxisStyle> = {
  tickLine: {
    size: 0,
    padding: 0,
  },
};

describe('Tooltip formatting', () => {
  const SPEC_ID_1 = 'bar_1';
  const SPEC_GROUP_ID_1 = 'bar_group_1';
  const SPEC_1 = MockSeriesSpec.bar({
    id: SPEC_ID_1,
    groupId: SPEC_GROUP_ID_1,
    data: [],
    xAccessor: 0,
    yAccessors: [1],
    yScaleType: ScaleType.Linear,
    xScaleType: ScaleType.Linear,
  });
  const bandedSpec = MockSeriesSpec.bar({
    ...SPEC_1,
    y0Accessors: [1],
  });
  const YAXIS_SPEC = MockGlobalSpec.yAxis({
    chartType: ChartType.XYAxis,
    specType: SpecType.Axis,
    id: 'axis_1',
    groupId: SPEC_GROUP_ID_1,
    hide: false,
    position: Position.Left,
    showOverlappingLabels: false,
    showOverlappingTicks: false,
    style,
    tickFormat: jest.fn((d) => `${d}`),
  });
  const seriesStyle = {
    rect: {
      opacity: 1,
    },
    rectBorder: {
      strokeWidth: 1,
      visible: false,
    },
    displayValue: {
      fill: 'black',
      fontFamily: '',
      fontSize: 2,
      offsetX: 0,
      offsetY: 0,
      padding: 2,
    },
  };
  const indexedGeometry = MockBarGeometry.default({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: 'blue',
    seriesIdentifier: {
      specId: SPEC_ID_1,
      key: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: [],
    },
    value: {
      x: 1,
      y: 10,
      accessor: 'y1',
      mark: null,
      datum: { x: 1, y: 10 },
    },
    seriesStyle,
  });
  const indexedBandedGeometry = MockBarGeometry.default({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: 'blue',
    seriesIdentifier: {
      specId: SPEC_ID_1,
      key: '',
      xAccessor: 'x',
      yAccessor: 'y1',
      splitAccessors: new Map(),
      seriesKeys: [],
    },
    value: {
      x: 1,
      y: 10,
      accessor: 'y1',
      mark: null,
      datum: { x: 1, y: 10 },
    },
    seriesStyle,
  });

  test('format simple tooltip', () => {
    const tooltipValue = formatTooltipValue(indexedGeometry, SPEC_1, false, false, false, YAXIS_SPEC);
    expect(tooltipValue).toBeDefined();
    expect(tooltipValue.valueAccessor).toBe('y1');
    expect(tooltipValue.label).toBe('bar_1');
    expect(tooltipValue.isHighlighted).toBe(false);
    expect(tooltipValue.color).toBe('blue');
    expect(tooltipValue.value).toBe(10);
    expect(tooltipValue.formattedValue).toBe('10');
    expect(tooltipValue.formattedValue).toBe('10');
    expect(YAXIS_SPEC.tickFormat).not.toHaveBeenCalledWith(null);
  });
  it('should set name as spec name when provided', () => {
    const name = 'test - spec';
    const tooltipValue = formatTooltipValue(
      indexedBandedGeometry,
      { ...SPEC_1, name },
      false,
      false,
      false,
      YAXIS_SPEC,
    );
    expect(tooltipValue.label).toBe(name);
  });
  it('should set name as spec id when name is not provided', () => {
    const tooltipValue = formatTooltipValue(indexedBandedGeometry, SPEC_1, false, false, false, YAXIS_SPEC);
    expect(tooltipValue.label).toBe(SPEC_1.id);
  });
  test('format banded tooltip - upper', () => {
    const tooltipValue = formatTooltipValue(indexedBandedGeometry, bandedSpec, false, false, true, YAXIS_SPEC);
    expect(tooltipValue.label).toBe('bar_1 - upper');
  });
  test('format banded tooltip - y1AccessorFormat', () => {
    const tooltipValue = formatTooltipValue(
      indexedBandedGeometry,
      { ...bandedSpec, y1AccessorFormat: ' [max]' },
      false,
      false,
      true,
      YAXIS_SPEC,
    );
    expect(tooltipValue.label).toBe('bar_1 [max]');
  });
  test('format banded tooltip - y1AccessorFormat as function', () => {
    const tooltipValue = formatTooltipValue(
      indexedBandedGeometry,
      { ...bandedSpec, y1AccessorFormat: (label) => `[max] ${label}` },
      false,
      false,
      true,
      YAXIS_SPEC,
    );
    expect(tooltipValue.label).toBe('[max] bar_1');
  });
  test('format banded tooltip - lower', () => {
    const tooltipValue = formatTooltipValue(
      {
        ...indexedBandedGeometry,
        value: {
          ...indexedBandedGeometry.value,
          accessor: 'y0',
        },
      },
      bandedSpec,
      false,
      false,
      true,
      YAXIS_SPEC,
    );
    expect(tooltipValue.label).toBe('bar_1 - lower');
  });
  test('format banded tooltip - y0AccessorFormat', () => {
    const tooltipValue = formatTooltipValue(
      {
        ...indexedBandedGeometry,
        value: {
          ...indexedBandedGeometry.value,
          accessor: 'y0',
        },
      },
      { ...bandedSpec, y0AccessorFormat: ' [min]' },
      false,
      false,
      true,
      YAXIS_SPEC,
    );
    expect(tooltipValue.label).toBe('bar_1 [min]');
  });
  test('format banded tooltip - y0AccessorFormat as function', () => {
    const tooltipValue = formatTooltipValue(
      {
        ...indexedBandedGeometry,
        value: {
          ...indexedBandedGeometry.value,
          accessor: 'y0',
        },
      },
      { ...bandedSpec, y0AccessorFormat: (label) => `[min] ${label}` },
      false,
      false,
      true,
      YAXIS_SPEC,
    );
    expect(tooltipValue.label).toBe('[min] bar_1');
  });
  test('format tooltip with seriesKeys name', () => {
    const geometry: BarGeometry = {
      ...indexedGeometry,
      seriesIdentifier: {
        specId: SPEC_ID_1,
        key: '',
        xAccessor: 'x',
        yAccessor: 'y1',
        splitAccessors: new Map(),
        seriesKeys: ['y1'],
      },
    };
    const tooltipValue = formatTooltipValue(geometry, SPEC_1, false, false, false, YAXIS_SPEC);
    expect(tooltipValue).toBeDefined();
    expect(tooltipValue.valueAccessor).toBe('y1');
    expect(tooltipValue.label).toBe('bar_1');
    expect(tooltipValue.isHighlighted).toBe(false);
    expect(tooltipValue.color).toBe('blue');
    expect(tooltipValue.value).toBe(10);
    expect(tooltipValue.formattedValue).toBe('10');
  });
  test('format y0 tooltip', () => {
    const geometry: BarGeometry = {
      ...indexedGeometry,
      value: {
        ...indexedGeometry.value,
        accessor: 'y0',
      },
    };
    const tooltipValue = formatTooltipValue(geometry, SPEC_1, false, false, false, YAXIS_SPEC);
    expect(tooltipValue).toBeDefined();
    expect(tooltipValue.valueAccessor).toBe('y0');
    expect(tooltipValue.label).toBe('bar_1');
    expect(tooltipValue.isHighlighted).toBe(false);
    expect(tooltipValue.color).toBe('blue');
    expect(tooltipValue.value).toBe(10);
    expect(tooltipValue.formattedValue).toBe('10');
  });
  test('format x tooltip', () => {
    const geometry: BarGeometry = {
      ...indexedGeometry,
      value: {
        ...indexedGeometry.value,
        accessor: 'y0',
      },
    };
    const tooltipHeader = formatTooltipHeader(geometry, SPEC_1, YAXIS_SPEC);
    expect(tooltipHeader).toBeDefined();
    expect(tooltipHeader.valueAccessor).toBeUndefined();
    expect(tooltipHeader.value).toBe(1);
    expect(tooltipHeader.formattedValue).toBe('1');
  });

  it('should format ticks with custom formatter from spec', () => {
    const axisTickFormatter: TickFormatter = (v) => `${v} axis`;
    const tickFormatter: TickFormatter = (v) => `${v} spec`;
    const axisSpec: AxisSpec = {
      ...YAXIS_SPEC,
      tickFormat: axisTickFormatter,
    };
    const spec: BarSeriesSpec = {
      ...SPEC_1,
      tickFormat: tickFormatter,
    };
    const tooltipValue = formatTooltipValue(indexedGeometry, spec, false, false, false, axisSpec);
    expect(tooltipValue.value).toBe(10);
    expect(tooltipValue.formattedValue).toBe('10 spec');
  });

  it('should format ticks with custom formatter from axis', () => {
    const axisTickFormatter: TickFormatter = (v) => `${v} axis`;
    const axisSpec: AxisSpec = {
      ...YAXIS_SPEC,
      tickFormat: axisTickFormatter,
    };
    const tooltipValue = formatTooltipValue(indexedGeometry, SPEC_1, false, false, false, axisSpec);
    expect(tooltipValue.value).toBe(10);
    expect(tooltipValue.formattedValue).toBe('10 axis');
  });

  it('should format ticks with default formatter', () => {
    const tooltipValue = formatTooltipValue(indexedGeometry, SPEC_1, false, false, false, YAXIS_SPEC);
    expect(tooltipValue.value).toBe(10);
    expect(tooltipValue.formattedValue).toBe('10');
  });

  it('should format header with custom formatter from axis', () => {
    const axisTickFormatter: TickFormatter = (v) => `${v} axis`;
    const tickFormatter: TickFormatter = (v) => `${v} spec`;
    const axisSpec: AxisSpec = {
      ...YAXIS_SPEC,
      tickFormat: axisTickFormatter,
    };
    const spec: BarSeriesSpec = {
      ...SPEC_1,
      tickFormat: tickFormatter,
    };
    const tooltipHeader = formatTooltipHeader(indexedGeometry, spec, axisSpec);
    expect(tooltipHeader.value).toBe(1);
    expect(tooltipHeader.formattedValue).toBe('1 axis');
  });

  it('should format header with default formatter from axis', () => {
    const tickFormatter: TickFormatter = (v) => `${v} spec`;
    const spec: BarSeriesSpec = {
      ...SPEC_1,
      tickFormat: tickFormatter,
    };
    const tooltipHeader = formatTooltipHeader(indexedGeometry, spec, YAXIS_SPEC);
    expect(tooltipHeader.value).toBe(1);
    expect(tooltipHeader.formattedValue).toBe('1');
  });

  describe('markFormat', () => {
    const markFormat = jest.fn((d) => `${d} number`);
    const markIndexedGeometry: BarGeometry = {
      ...indexedGeometry,
      value: {
        x: 1,
        y: 10,
        accessor: 'y1',
        mark: 10,
        datum: { x: 1, y: 10 },
      },
    };

    it('should format mark value with markFormat', () => {
      const tooltipValue = formatTooltipValue(
        markIndexedGeometry,
        {
          ...SPEC_1,
          markFormat,
        },
        false,
        false,
        false,
        YAXIS_SPEC,
      );
      expect(tooltipValue).toBeDefined();
      expect(tooltipValue.markValue).toBe(10);
      expect(tooltipValue.formattedMarkValue).toBe('10 number');
      expect(markFormat).toHaveBeenCalledWith(10, undefined);
    });

    it('should format mark value with defaultTickFormatter', () => {
      const tooltipValue = formatTooltipValue(markIndexedGeometry, SPEC_1, false, false, false, YAXIS_SPEC);
      expect(tooltipValue).toBeDefined();
      expect(tooltipValue.markValue).toBe(10);
      expect(tooltipValue.formattedMarkValue).toBe('10');
      expect(markFormat).not.toHaveBeenCalled();
    });
  });
});
