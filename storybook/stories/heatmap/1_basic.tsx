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
} from '@elastic/charts';
import { Config } from '@elastic/charts/src/chart_types/heatmap/layout/types/config_types';
import { SWIM_LANE_DATA } from '@elastic/charts/src/utils/data_samples/test_anomaly_swim_lane';

import { useBaseTheme } from '../../use_base_theme';

export const Example = () => {
  const [selection, setSelection] = useState<{ x: (string | number)[]; y: (string | number)[] } | undefined>();

  const persistCellsSelection = boolean('Persist cells selection', true);
  const debugState = boolean('Enable debug state', true);
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
      },
      xAxisLabel: {
        formatter: (value: string | number) => {
          return niceTimeFormatter([1572825600000, 1572912000000])(value, { timeZone: 'UTC' });
        },
      },
      onBrushEnd: ((e) => {
        setSelection({ x: e.x, y: e.y });
      }) as Config['onBrushEnd'],
    }),
    [],
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

  // @ts-ignore
  const onElementClick: ElementClickListener = useCallback((e: HeatmapElementEvent[]) => {
    const cell = e[0][0];
    // @ts-ignore
    setSelection({ x: [cell.datum.x, cell.datum.x], y: [cell.datum.y] });
  }, []);

  return (
    <Chart>
      <Settings
        onElementClick={onElementClick}
        onRenderChange={logDebugState}
        showLegend
        legendPosition="right"
        onBrushEnd={action('onBrushEnd')}
        brushAxis="both"
        xDomain={{ min: 1572825600000, max: 1572912000000, minInterval: 1800000 }}
        debugState={debugState}
        baseTheme={useBaseTheme()}
      />
      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 3, color: '#d2e9f7' },
            { start: 3, end: 25, color: '#8bc8fb' },
            { start: 25, end: 50, color: '#fdec25' },
            { start: 50, end: 75, color: '#fba740' },
            { start: 75, end: Infinity, color: '#fe5050' },
          ],
        }}
        data={SWIM_LANE_DATA.map((v) => ({ ...v, time: v.time * 1000 }))}
        xAccessor={(d) => d.time}
        yAccessor={(d) => d.laneLabel}
        valueAccessor={(d) => d.value}
        valueFormatter={(d) => d.toFixed(0.2)}
        ySortPredicate="numAsc"
        xScaleType={ScaleType.Time}
        config={config}
        highlightedData={persistCellsSelection ? selection : undefined}
      />
    </Chart>
  );
};
