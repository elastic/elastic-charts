/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useState } from 'react';

import type { SeriesColorAccessor, SeriesNameFn } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings, Tooltip, TooltipType } from '@elastic/charts';

import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

/**
 * Recreates the Kibana many-series performance journey chart
 * (`x-pack/performance/journeys_e2e/many_series_chart_dashboard.ts`).
 *
 * Lens emits 3 stacked `BarSeries` specs (one per y accessor), each split by
 * `order_id` (~649 values) so Elastic Charts materializes ~1947 series.
 * Histogram mode is on because Lens treats ES|QL date columns as interval
 * buckets even though this query has no `BUCKET()`.
 *
 * Dataset lives in `public/many_series_ecommerce.json` so Storybook and the
 * playground can both fetch it as static JSON.
 */
type EcommerceRow = {
  order_date: number;
  order_id: string;
  total_quantity: number;
  overallAvgQnt: number;
  avgQnt: number;
};

const Y_ACCESSORS = ['total_quantity', 'overallAvgQnt', 'avgQnt'] as const;
const LAYER_ID = '0b226fa9-39b4-44e7-82ae-97fbacfe964f';
const X_DOMAIN = { min: 1785322858728, max: 1786799230394 };

// EUI colorblind categorical palette used by Kibana's default Lens palette.
const PALETTE = [
  '#54B399',
  '#6092C0',
  '#D36086',
  '#9170B8',
  '#CA8EAE',
  '#D6BF57',
  '#B9A888',
  '#DA8B45',
  '#AA6556',
  '#E7664C',
];

function buildColorAccessor(rows: EcommerceRow[]): SeriesColorAccessor {
  const colorByOrderId = new Map<string, string>();
  for (const row of rows) {
    if (!colorByOrderId.has(row.order_id)) {
      colorByOrderId.set(row.order_id, PALETTE[colorByOrderId.size % PALETTE.length]);
    }
  }
  return ({ splitAccessors }) => {
    const orderId = String(splitAccessors.get('order_id') ?? '');
    return colorByOrderId.get(orderId) ?? PALETTE[0];
  };
}

export const Example: ChartsStory = (_, context) => {
  const title = context?.title;
  const description = context?.description;
  const [data, setData] = useState<EcommerceRow[]>([]);
  useEffect(() => {
    async function fetchData() {
      console.log('requesting data');
      const response = await fetch('many_series_ecommerce.json');
      const d: EcommerceRow[] = await response.json();
      console.log('data arrived');

      window.performance.mark('Perf:Started');
      setData(d);
    }
    fetchData().catch(() => {});
  }, []);

  const theme = useBaseTheme();
  if (data.length === 0) {
    return <div>no data</div>;
  }

  const color = buildColorAccessor(data);

  return (
    <Chart title={title} description={description}>
      <Tooltip type={TooltipType.VerticalCursor} />
      <Settings
        showLegend
        legendPosition={Position.Right}
        legendSize={50}
        legendValues={[]}
        rotation={0}
        xDomain={X_DOMAIN}
        allowBrushingLastHistogramBin
        baseTheme={theme}
        theme={{
          legend: { labelOptions: { maxLines: 1 } },
          chartMargins: { left: 0, right: 0, top: 0, bottom: 0 },
        }}
        onRenderChange={(isRendered) => {
          if (isRendered) {
            console.log('chart rendered');
            window.performance.mark('Perf:Ended');
          }
        }}
      />
      <Axis id="x" position={Position.Bottom} title="order_date" gridLine={{ visible: true }} />
      <Axis id="left" groupId="left" position={Position.Left} title="total_quantity" gridLine={{ visible: true }} />
      {Y_ACCESSORS.map((yAccessor) => {
        const name: SeriesNameFn = ({ splitAccessors }) => `${splitAccessors.get('order_id')} - ${yAccessor}`;
        return (
          <BarSeries
            key={yAccessor}
            id={`${LAYER_ID}:order_date:${yAccessor}:order_id`}
            name={name}
            xAccessor="order_date"
            yAccessors={[yAccessor]}
            splitSeriesAccessors={['order_id']}
            stackAccessors={['order_date']}
            data={data}
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            groupId="left"
            enableHistogramMode
            minBarHeight={1}
            timeZone="UTC"
            color={color}
            displayValueSettings={{ showValueLabel: false }}
          />
        );
      })}
    </Chart>
  );
};
