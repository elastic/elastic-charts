/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, button, number, select } from '@storybook/addon-knobs';
import React, { useCallback, useMemo, useState } from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  PointerEvent,
  Placement,
  niceTimeFormatter,
  TooltipType,
  LineSeries,
  AreaSeries, RecursivePartial, HeatmapStyle, ElementClickListener, HeatmapElementEvent, HeatmapBrushEvent, Heatmap,
} from '@elastic/charts';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';
import { palettes } from '@elastic/charts/src/utils/themes/colors';

import { useBaseTheme } from '../../use_base_theme';
import { getTooltipTypeKnob, getPlacementKnob } from '../utils/knobs';
import { getDebugStateLogger } from '../utils/debug_state_logger';
import { DATA_6 } from '@elastic/charts/src/utils/data_samples/test_dataset_heatmap';

const chartTypes: Record<string, any> = {
  bar: BarSeries,
  line: LineSeries,
  area: AreaSeries,
};

const getSeriesKnob = (group?: string) => {
  const type =
    select<string>(
      'Series type',
      {
        Bar: 'bar',
        Line: 'line',
        Area: 'area',
      },
      'bar',
      group,
    ) ?? 'bar';
  return chartTypes[type] ?? BarSeries;
};

export const Example = () => {
  const ref1 = React.useRef<Chart>(null);
  const ref2 = React.useRef<Chart>(null);
  const ref3 = React.useRef<Chart>(null);

  const pointerUpdate = (event: PointerEvent) => {
    action('onPointerUpdate')(event);
    if (ref1.current) {
      ref1.current.dispatchExternalPointerEvent(event);
    }
    if (ref2.current) {
      ref2.current.dispatchExternalPointerEvent(event);
    }
    if (ref3.current) {
      ref3.current.dispatchExternalPointerEvent(event);
    }

  };
  const { data } = KIBANA_METRICS.metrics.kibana_os_load[0];
  const data1 = KIBANA_METRICS.metrics.kibana_os_load[0].data;
  const data2 = KIBANA_METRICS.metrics.kibana_os_load[1].data;

  const group1 = 'Top Chart';
  const group2 = 'Bottom Chart';

  const TopSeries = getSeriesKnob(group1);
  const BottomSeries = getSeriesKnob(group2);
  const topType = getTooltipTypeKnob('local tooltip type', TooltipType.VerticalCursor, group1);
  const bottomType = getTooltipTypeKnob('local tooltip type', TooltipType.VerticalCursor, group2);
  const topVisible = boolean('enable external tooltip', true, group1);
  const bottomVisible = boolean('enable external tooltip', true, group2);
  const topPlacement = getPlacementKnob('external tooltip placement', Placement.Left, group1);
  const bottomPlacement = getPlacementKnob('external tooltip placement', Placement.Left, group2);

  const debounceDelay = number('pointer update debounce', 20, { min: 0, max: 200, step: 10 });
  const trigger =
    select(
      'pointer update trigger',
      {
        'Only x': 'x',
        'Only y': 'y',
        'Both x and y': 'both',
      },
      'x',
    ) ?? 'x';

  const [selection, setSelection] = useState<{ x: (string | number)[]; y: (string | number)[] } | undefined>();

  const persistCellsSelection = boolean('Persist cells selection', true);
  const debugState = boolean('Enable debug state', true);
  const showXAxisTitle = boolean('Show x axis title', false);
  const showYAxisTitle = boolean('Show y axis title', false);

  const handler = useCallback(() => {
    setSelection(undefined);
  }, []);

  button('Clear cells selection', handler);

  const heatmap = useMemo(() => {
    const styles: RecursivePartial<HeatmapStyle> = {
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
    };

    return styles;
  }, []);



  const onElementClick: ElementClickListener = useCallback((e) => {

    const cell = (e as HeatmapElementEvent[])[0][0];
    setSelection({ x: [cell.datum.x, cell.datum.x], y: [cell.datum.y] });
  }, []);

  const onBrushEnd = action('onBrushEnd');


  return (
    <>
      <Chart>
        <Settings
          onElementClick={onElementClick}
          onPointerUpdate={pointerUpdate}
          onRenderChange={getDebugStateLogger(debugState)}
          showLegend
          legendPosition="right"
          brushAxis="both"
          xDomain={{ min: 1572825600000 - 21409200000, max: 1572912000000 - 21409200000 }}
          debugState={debugState}
          theme={{ heatmap }}
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
          data={DATA_6.data.map(d => ({...d, x: d.x - 21409200000}))}
          xAccessor="x"
          yAccessor="y"
          valueAccessor="value"
          valueFormatter={(d) => `${Number(d.toFixed(2))}℃`}
          ySortPredicate="numAsc"
          xScale={{ type: ScaleType.Time, interval: DATA_6.interval }}
          xAxisLabelFormatter={(value) => {
            return niceTimeFormatter([1572825600000 - 21409200000, 1572912000000 - 21409200000])(value, { timeZone: 'UTC' });
          }}
          timeZone={DATA_6.timeZone}
          onBrushEnd={(e) => {
            setSelection({ x: e.x, y: e.y });
          }}
          highlightedData={persistCellsSelection ? selection : undefined}
          xAxisTitle={showXAxisTitle ? 'Bottom axis' : undefined}
          yAxisTitle={showYAxisTitle ? 'Left axis' : undefined}
        />
      </Chart>

      <Chart ref={ref1} size={{ height: '50%' }} id="chart1">
        <Settings
          showLegend
          showLegendExtra
          baseTheme={useBaseTheme()}
          onPointerUpdate={pointerUpdate}
          pointerUpdateDebounce={debounceDelay}
          pointerUpdateTrigger={trigger}
          externalPointerEvents={{
            tooltip: { visible: topVisible, placement: topPlacement },
          }}
          tooltip={{ type: topType }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          title={`External tooltip visible: ${topVisible} - boundary: scroll parent`}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis id="left2" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

        <TopSeries
          id="Top"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={data1.slice(3, 60)}
        />
      </Chart>
      <Chart ref={ref2} size={{ height: '50%' }} id="chart2">
        <Settings
          showLegend
          showLegendExtra
          onPointerUpdate={pointerUpdate}
          tooltip={{
            type: bottomType,
          }}
          externalPointerEvents={{
            tooltip: { visible: topVisible, placement: topPlacement },
          }}
        />
        <Axis
          id="bottom"
          position={Position.Bottom}
          title={`External tooltip visible: ${bottomVisible} - boundary: chart`}
          tickFormat={niceTimeFormatter([data[0][0], data[data.length - 1][0]])}
        />
        <Axis
          id="left2"
          position={Position.Left}
          tickFormat={(d: any) => Number(d).toFixed(2)}
          domain={{ min: 5, max: 20 }}
        />

        <BottomSeries
          id="Bottom"
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Sqrt}
          xAccessor={0}
          yAccessors={[1]}
          data={data2.slice(10)}
          color={palettes.echPaletteForLightBackground.colors[0]}
        />
      </Chart>

    </>
  );
};

Example.parameters = {
  markdown: 'Sends an event every time the cursor changes. This is provided to sync cursors between multiple charts.',
};
