/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';

import type { SettingsSpec } from './settings';
import { Settings } from './settings';
import { SpecsParser } from './specs_parser';
import type { GlobalChartState } from '../state/chart_state';
import { createChartStore } from '../state/chart_state';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import type { Rendering, Rotation } from '../utils/common';
import { Position } from '../utils/common';
import { DARK_THEME } from '../utils/themes/dark_theme';
import { LIGHT_THEME } from '../utils/themes/light_theme';
import type { PartialTheme } from '../utils/themes/theme';

const getProxy = (chartStore: Store<GlobalChartState>) =>
  function SettingsProxy({ settings }: { settings?: Partial<SettingsSpec> }) {
    return (
      <Provider store={chartStore}>
        <SpecsParser>
          <Settings {...settings} />
        </SpecsParser>
      </Provider>
    );
  };
describe('Settings spec component', () => {
  let chartStore: Store<GlobalChartState>;
  let SettingsProxy: ({ settings }: { settings?: Partial<SettingsSpec> }) => JSX.Element;
  beforeEach(() => {
    chartStore = createChartStore('chart_id');

    expect(chartStore.getState().specsInitialized).toBe(false);
    SettingsProxy = getProxy(chartStore);
  });
  test('should update store on mount if spec has a chart store', () => {
    render(
      <Provider store={chartStore}>
        <SpecsParser />
      </Provider>,
    );
    expect(getSettingsSpecSelector(chartStore.getState()).rotation).toBe(0);

    render(
      <Provider store={chartStore}>
        <SpecsParser>
          <Settings rotation={90} />
        </SpecsParser>
      </Provider>,
    );
    expect(getSettingsSpecSelector(chartStore.getState()).rotation).toBe(90);
  });

  test('should update store on component update', () => {
    const { rerender } = render(<SettingsProxy />);
    let settingSpec = getSettingsSpecSelector(chartStore.getState());
    expect(settingSpec.baseTheme).toEqual(LIGHT_THEME);
    expect(settingSpec.rotation).toBe(0);
    rerender(
      <SettingsProxy
        settings={{
          baseTheme: DARK_THEME,
          rotation: 90 as Rotation,
          rendering: 'svg' as Rendering,
          animateData: true,
          showLegend: true,
          legendPosition: Position.Bottom,
          debug: true,
          xDomain: { min: 0, max: 10 },
        }}
      />,
    );
    settingSpec = getSettingsSpecSelector(chartStore.getState());
    expect(settingSpec.baseTheme).toEqual(DARK_THEME);
    expect(settingSpec.rotation).toBe(90);
    expect(settingSpec.rendering).toBe('svg');
    expect(settingSpec.animateData).toBe(true);
    expect(settingSpec.showLegend).toEqual(true);
    expect(settingSpec.legendPosition).toBe(Position.Bottom);
    expect(settingSpec.legendValues).toEqual([]);
    expect(settingSpec.debug).toBe(true);
    expect(settingSpec.xDomain).toEqual({ min: 0, max: 10 });
  });

  test('should set event listeners on chart store', () => {
    render(<SettingsProxy />);
    let settingSpec = getSettingsSpecSelector(chartStore.getState());

    expect(settingSpec.onElementClick).toBeUndefined();
    expect(settingSpec.onElementOver).toBeUndefined();
    expect(settingSpec.onElementOut).toBeUndefined();
    expect(settingSpec.onBrushEnd).toBeUndefined();
    expect(settingSpec.onLegendItemOver).toBeUndefined();
    expect(settingSpec.onLegendItemOut).toBeUndefined();
    expect(settingSpec.onLegendItemClick).toBeUndefined();
    expect(settingSpec.onLegendItemPlusClick).toBeUndefined();
    expect(settingSpec.onLegendItemMinusClick).toBeUndefined();

    const onElementClick = jest.fn();
    const onElementOver = jest.fn();
    const onOut = jest.fn();
    const onBrushEnd = jest.fn();
    const onLegendEvent = jest.fn();
    const onPointerUpdateEvent = jest.fn();
    const onRenderChangeEvent = jest.fn();

    const updatedProps: Partial<SettingsSpec> = {
      onElementClick,
      onElementOver,
      onElementOut: onOut,
      onBrushEnd,
      onLegendItemOver: onLegendEvent,
      onLegendItemOut: onOut,
      onLegendItemClick: onLegendEvent,
      onLegendItemPlusClick: onLegendEvent,
      onLegendItemMinusClick: onLegendEvent,
      onPointerUpdate: onPointerUpdateEvent,
      onRenderChange: onRenderChangeEvent,
    };

    render(<SettingsProxy settings={updatedProps} />);
    settingSpec = getSettingsSpecSelector(chartStore.getState());

    expect(settingSpec.onElementClick).toEqual(onElementClick);
    expect(settingSpec.onElementOver).toEqual(onElementOver);
    expect(settingSpec.onElementOut).toEqual(onOut);
    expect(settingSpec.onBrushEnd).toEqual(onBrushEnd);
    expect(settingSpec.onLegendItemOver).toEqual(onLegendEvent);
    expect(settingSpec.onLegendItemOut).toEqual(onOut);
    expect(settingSpec.onLegendItemClick).toEqual(onLegendEvent);
    expect(settingSpec.onLegendItemPlusClick).toEqual(onLegendEvent);
    expect(settingSpec.onLegendItemMinusClick).toEqual(onLegendEvent);
    expect(settingSpec.onRenderChange).toEqual(onRenderChangeEvent);

    // check for debounced functions
    expect(settingSpec.onPointerUpdate).toBeDefined();
  });

  test('should allow partial theme', () => {
    render(<SettingsProxy />);
    let settingSpec = getSettingsSpecSelector(chartStore.getState());
    expect(settingSpec.baseTheme).toEqual(LIGHT_THEME);

    const partialTheme: PartialTheme = {
      colors: {
        defaultVizColor: 'aquamarine',
      },
    };

    const updatedProps: Partial<SettingsSpec> = {
      theme: partialTheme,
      baseTheme: DARK_THEME,
      rotation: 90 as Rotation,
      rendering: 'svg' as Rendering,
      animateData: true,
      showLegend: true,
      legendPosition: Position.Bottom,
      legendValues: [],
      debug: true,
      xDomain: { min: 0, max: 10 },
    };

    render(<SettingsProxy settings={updatedProps} />);

    settingSpec = getSettingsSpecSelector(chartStore.getState());
    /*
     * the theme is no longer stored into the setting spec.
     * it's final theme object is computed through selectors
     */
    const theme = getChartThemeSelector(chartStore.getState());
    expect(theme).toEqual({
      ...DARK_THEME,
      colors: {
        ...DARK_THEME.colors,
        ...partialTheme.colors,
      },
    });
  });
});
