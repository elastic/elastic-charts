/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, button } from '@storybook/addon-knobs';
import React, { useCallback, useMemo, useState } from 'react';
import { debounce } from 'ts-debounce';

import {
  Chart,
  DebugState,
  Heatmap,
  HeatmapElementEvent,
  niceTimeFormatter,
  RecursivePartial,
  ScaleType,
  Settings,
  HeatmapBrushEvent,
  ElementClickListener,
} from '@elastic/charts';
import { Config } from '@elastic/charts/src/chart_types/heatmap/layout/types/config_types';

import { DATA_6 } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const [selection, setSelection] = useState<{ x: (string | number)[]; y: (string | number)[] } | undefined>();

  const persistCellsSelection = boolean('Persist cells selection', true);
  const debugState = boolean('Enable debug state', true);
  const showXAxisTitle = boolean('show x axis title', false);
  const showYAxisTitle = boolean('show y axis title', false);
  const dataStateAction = action('DataState');

  const handler = useCallback(() => {
    setSelection(undefined);
  }, []);

  button('Clear cells selection', handler);

  const config: RecursivePartial<Config> = useMemo(
    () => ({
      brushTool: {
        visible: true,
      },
      grid: {
        cellHeight: {
          min: 20,
        },
        stroke: {
          width: 0.5,
          color: '#bababa',
        },
      },
      cell: {
        maxWidth: 'fill',
        maxHeight: 3,
        label: {
          visible: false,
        },
        border: {
          stroke: 'transparent',
          strokeWidth: 0,
        },
      },
      yAxisLabel: {
        visible: true,
        width: 'auto',
        padding: { left: 10, right: 10 },
        title: showYAxisTitle ? 'left' : undefined,
      },
      xAxisLabel: {
        formatter: (value: string | number) => {
          return niceTimeFormatter([1572825600000, 1572912000000])(value, { timeZone: 'UTC' });
        },
        title: showXAxisTitle ? 'bottom' : undefined,
      },
      timeZone: DATA_6.timeZone,
    }),
    [showXAxisTitle, showYAxisTitle],
  );

  const logDebugState = debounce(() => {
    if (!debugState) return;

    const statusEl = document.querySelector<HTMLDivElement>('.echChartStatus');

    if (statusEl) {
      const dataState = statusEl.dataset.echDebugState
        ? (JSON.parse(statusEl.dataset.echDebugState) as DebugState)
        : null;
      dataStateAction(dataState);
    }
  }, 100);

  const onElementClick: ElementClickListener = useCallback((event) => {
    const e = event as HeatmapElementEvent[];
    const cell = e[0][0];
    setSelection({ x: [cell.datum.x, cell.datum.x], y: [cell.datum.y] });
  }, []);

  const onBrushEnd = action('onBrushEnd');

  return (
    <Chart>
      <Settings
        onElementClick={onElementClick}
        onRenderChange={logDebugState}
        showLegend
        legendPosition="right"
        brushAxis="both"
        xDomain={{ min: 1572825600000, max: 1572912000000 }}
        debugState={debugState}
        baseTheme={useBaseTheme()}
        onBrushEnd={(e) => {
          onBrushEnd(e);
          const { x, y } = e as HeatmapBrushEvent;
          setSelection({ x, y });
        }}
      />
      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 3.5, color: '#d2e9f7' },
            { start: 3.5, end: 25, color: '#8bc8fb' },
            { start: 25, end: 50, color: '#fdec25' },
            { start: 50, end: 75, color: '#fba740' },
            { start: 75, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={DATA_6.data}
        xAccessor="x"
        yAccessor="y"
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
        ySortPredicate="numAsc"
        xScale={{ type: ScaleType.Time, interval: DATA_6.interval }}
        config={config}
        highlightedData={persistCellsSelection ? selection : undefined}
      />
    </Chart>
  );
};
