/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeLegendSelector } from './compute_legend';
import { getLongestLegendFormattedValueSelector } from './get_legend_max_formatted_value';
import { LegendValue } from '../../../../common/legend';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onToggleDeselectSeriesAction } from '../../../../state/actions/legend';
import { onPointerMove } from '../../../../state/actions/mouse';
import { Position } from '../../../../utils/common';
import type { LineSeriesSpec } from '../../utils/specs';
import { StackMode } from '../../utils/specs';

const settings = () =>
  MockGlobalSpec.settings({
    showLegend: true,
    legendLayout: 'list',
    legendPosition: Position.Bottom,
    legendValues: [LegendValue.CurrentAndLastValue],
  });
const data = (values: Array<number | null>) => values.map((y, x) => ({ x, y }));
const line = (values: Array<number | null>, overrides: Partial<LineSeriesSpec> = {}) =>
  MockSeriesSpec.line({
    data: data(values),
    xScaleType: ScaleType.Linear,
    ...overrides,
  });
const createStore = (...specs: Parameters<typeof MockStore.addSpecs>[0][]) => {
  const store = MockStore.default();
  MockStore.addSpecs([settings(), ...specs.flat()], store);
  return store;
};

// Deliberately proportional: fewer wide letters can occupy more space than many narrow digits.
const measureText = jest.fn((text: string) => ({
  width: [...text].reduce((width, character) => width + (character === 'W' ? 12 : character === 'i' ? 2 : 6), 0),
}));

describe('legend current value width', () => {
  let getContextSpy: jest.SpiedFunction<HTMLCanvasElement['getContext']>;
  beforeEach(() => {
    getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      save: jest.fn(),
      restore: jest.fn(),
      measureText,
      font: '',
    } as unknown as CanvasRenderingContext2D);
  });
  afterEach(() => getContextSpy.mockRestore());

  it('reserves room for optional decimals between domain endpoints', () => {
    const store = createStore(line([3.5, 7.25, 12]));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('7.25');
  });

  it('accounts for adaptive units', () => {
    const store = createStore(
      line([500, 1024], { tickFormat: (v: number) => (v >= 1024 ? `${v / 1024} KB` : `${v} Bytes`) }),
    );
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('500 Bytes');
  });

  it('includes negative values', () => {
    const store = createStore(line([-2000.25, 12]));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('-2000.25');
  });

  it('uses each axis group formatter with that group data', () => {
    const store = createStore(
      line([1, 2], { id: 'left', groupId: 'left' }),
      line([500, 1024], { id: 'right', groupId: 'right' }),
      MockGlobalSpec.yAxis({ groupId: 'left', id: 'left-axis', tickFormat: (v: number) => `${v} s` }),
      MockGlobalSpec.yAxis({
        groupId: 'right',
        id: 'right-axis',
        position: Position.Right,
        tickFormat: (v: number) => (v >= 1024 ? '1 KB' : `${v} Bytes`),
      }),
    );
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('500 Bytes');
  });

  it('prefers the series formatter and measures pixels instead of character count', () => {
    const store = createStore(
      line([1, 2], { tickFormat: (v: number) => (v === 1 ? 'WWW' : 'iiiiii') }),
      MockGlobalSpec.yAxis({ tickFormat: () => 'axis formatter should not be used' }),
    );
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('WWW');
  });

  it('allows for tabular digits when comparing formatted widths', () => {
    const store = createStore(line([1, 2], { tickFormat: (v: number) => (v === 1 ? '11111' : '0000') }));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('11111');
  });

  it('includes the lower value of a band', () => {
    const store = createStore(
      MockSeriesSpec.area({
        xScaleType: ScaleType.Linear,
        y0Accessors: ['lower'],
        data: [
          { x: 0, y: 2, lower: -1000.25 },
          { x: 1, y: 4, lower: 1 },
        ],
      }),
    );
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('-1000.25');
  });

  it('uses percentage values instead of stacked domain totals', () => {
    const store = createStore(
      MockSeriesSpec.bar({
        xScaleType: ScaleType.Linear,
        yAccessors: ['a', 'b'],
        stackAccessors: ['x'],
        stackMode: StackMode.Percentage,
        data: [{ x: 0, a: 1, b: 3 }],
        tickFormat: (v: number) => `${v * 100}%`,
      }),
    );
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('25%');
  });

  it('ignores missing and non-finite values', () => {
    const formatter = jest.fn(String);
    const store = createStore(line([null, NaN, Infinity, -Infinity], { tickFormat: formatter }));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBeUndefined();
    expect(formatter).not.toHaveBeenCalled();
  });

  it('keeps the full-data width when the widest series is deselected', () => {
    const store = createStore(line([7.25, 12], { id: 'wide' }), line([1, 2], { id: 'short' }));
    const items = computeLegendSelector(store.getState());
    const wide = items.find((item) => item.seriesIdentifiers[0]?.specId === 'wide')!;
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('7.25');
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: wide.seriesIdentifiers }));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('7.25');
  });

  it('does not reformat or measure the dataset on pointer movement', () => {
    const formatter = jest.fn(String);
    const store = createStore(line([3.5, 7.25, 12], { tickFormat: formatter }));
    getLongestLegendFormattedValueSelector(store.getState());
    formatter.mockClear();
    measureText.mockClear();
    store.dispatch(onPointerMove({ position: { x: 20, y: 20 }, time: 0 }));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('7.25');
    expect(formatter).not.toHaveBeenCalled();
    expect(measureText).not.toHaveBeenCalled();
  });

  it('measures the same formatted label only once', () => {
    const store = createStore(line([7.25, 7.25, 7.25]));
    measureText.mockClear();
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('7.25');
    expect(measureText.mock.calls.filter(([label]) => label === '0.00')).toHaveLength(1);
  });

  it('accounts for hover formatter options as well as last values', () => {
    const store = createStore(
      line([1, 2], {
        timeZone: 'UTC',
        tickFormat: (v: number, options?: { timeZone?: string }) => (options ? `${v} ${options.timeZone}` : String(v)),
      }),
    );
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('1 UTC');
  });

  it('includes renormalized percentages after deselection', () => {
    const store = createStore(
      MockSeriesSpec.bar({
        xScaleType: ScaleType.Linear,
        yAccessors: ['a', 'b'],
        stackAccessors: ['x'],
        stackMode: StackMode.Percentage,
        data: [{ x: 0, a: 1, b: 3 }],
        tickFormat: (v: number) => (v === 1 ? 'Full capacity' : `${v * 100}%`),
      }),
    );
    const items = computeLegendSelector(store.getState());
    store.dispatch(onToggleDeselectSeriesAction({ legendItemIds: items[0]!.seriesIdentifiers }));
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBe('Full capacity');
  });

  it.each([
    { showLegend: false },
    { legendValues: [] },
    { legendLayout: 'table' as const },
    { legendLayout: undefined },
    { legendPosition: Position.Right },
  ])('skips the scan when width reservation is not used: %p', (configuration) => {
    const formatter = jest.fn(String);
    const store = createStore(line([3.5, 7.25, 12], { tickFormat: formatter }));
    MockStore.addSpecs({ ...settings(), ...configuration }, store);
    expect(getLongestLegendFormattedValueSelector(store.getState())).toBeUndefined();
    expect(formatter).not.toHaveBeenCalled();
  });
});
