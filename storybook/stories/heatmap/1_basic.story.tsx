/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import React, { useMemo } from 'react';

import type { HeatmapStyle, PointerEvent, RecursivePartial } from '@elastic/charts';
import { Chart, Heatmap, niceTimeFormatter, ScaleType, Settings } from '@elastic/charts';
import { EUI_DARK, EUI_LIGHT } from '@elastic/charts/src/utils/themes/eui_borealis_colors.generated';

import { DATA_6 } from '../../../packages/charts/src/utils/data_samples/test_dataset_heatmap';
import type { ChartsStory } from '../../types';
import { ThemeId, useBaseTheme, useThemeId } from '../../use_base_theme';
import { getDebugStateLogger } from '../utils/debug_state_logger';
import { useHeatmapSelection } from '../utils/use_heatmap_selection';

export const Example: ChartsStory = (_, { title, description }) => {
  const { highlightedData, onElementClick, onBrushEnd } = useHeatmapSelection();

  const debugState = boolean('Enable debug state', true);
  const showXAxisTitle = boolean('Show x axis title', false);
  const showYAxisTitle = boolean('Show y axis title', false);
  const showBrushTool = boolean('Show pointer brush area', true);
  const themeId = useThemeId();
  const severity = (themeId === ThemeId.Dark || themeId === ThemeId.LegacyDark ? EUI_DARK : EUI_LIGHT).severity;

  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
  };

  const heatmap = useMemo(() => {
    const styles: RecursivePartial<HeatmapStyle> = {
      brushTool: {
        visible: showBrushTool,
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
    };

    return styles;
  }, [showBrushTool]);

  return (
    <Chart title={title} description={description}>
      <Settings
        onElementClick={onElementClick}
        onPointerUpdate={pointerUpdate}
        onRenderChange={getDebugStateLogger(debugState)}
        showLegend
        legendPosition="right"
        brushAxis="both"
        xDomain={{ min: 1572825600000, max: 1572912000000 }}
        debugState={debugState}
        theme={{ heatmap }}
        baseTheme={useBaseTheme()}
        onBrushEnd={onBrushEnd}
      />
      <Heatmap
        id="heatmap1"
        colorScale={{
          type: 'bands',
          bands: [
            { start: -Infinity, end: 3.5, color: severity.neutral },
            { start: 3.5, end: 25, color: severity.success },
            { start: 25, end: 50, color: severity.warning },
            { start: 50, end: 75, color: severity.risk },
            { start: 75, end: Infinity, color: severity.danger },
          ],
        }}
        data={DATA_6.data}
        xAccessor="x"
        yAccessor="y"
        valueAccessor="value"
        valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
        ySortPredicate="numAsc"
        xScale={{ type: ScaleType.Time, interval: DATA_6.interval }}
        xAxisLabelFormatter={(value) => {
          return niceTimeFormatter([1572825600000, 1572912000000])(value, { timeZone: 'UTC' });
        }}
        timeZone={DATA_6.timeZone}
        highlightedData={highlightedData}
        xAxisTitle={showXAxisTitle ? 'Bottom axis' : undefined}
        yAxisTitle={showYAxisTitle ? 'Left axis' : undefined}
      />
    </Chart>
  );
};
