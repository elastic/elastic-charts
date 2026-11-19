/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useLayoutEffect, useRef, useState } from 'react';

import type { ChartProps } from '@elastic/charts';
import { Chart } from '@elastic/charts';
import { renderChart } from '@elastic/charts/src/headless';
import { getChartSize } from '@elastic/charts/src/utils/chart_size';

// eslint-disable-next-line @typescript-eslint/unbound-method -- only ever called on a chart
const renderLive = Chart.prototype.render;
/** true while `renderChart` runs: the charts it renders by itself render as they always do */
let rendering = false;
let charts = 0;

/**
 * Stands where a story mounts a `Chart`: takes the space the chart would take, and fills it with the markup
 * that `renderChart` returns for the same chart at that size.
 */
function HeadlessChart(props: ChartProps) {
  const host = useRef<HTMLDivElement>(null);
  // without an id every render would get a random one, and markup that never settles
  const [id] = useState(() => props.id ?? `headless-${++charts}`);
  // observed as a chart observes its container: a story can size it after the chart is mounted
  const [size, setSize] = useState<{ width: number; height: number }>();
  const [result, setResult] = useState<{ markup?: string; error?: string }>();

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      // as a chart, it draws nothing while it has no room
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(host.current!);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!size) return;
    rendering = true;
    try {
      setResult({ markup: renderChart(<Chart {...props} id={id} size={size} />) });
    } catch (error) {
      // A chart type that `renderChart` refuses shows the refusal in place of the chart. Any other error is
      // left to fail the test of the story, as an error of a mounted chart does.
      if (!String(error).includes('renderChart does not support')) throw error;
      setResult({ error: String(error) });
    } finally {
      rendering = false;
    }
  }, [props, id, size]);

  const content = result?.error
    ? { children: <div className="echChart">{result.error}</div> }
    : { dangerouslySetInnerHTML: { __html: result?.markup ?? '' } };
  return (
    <div
      ref={host}
      className="echHeadlessChart"
      data-rendered={result !== undefined}
      style={getChartSize(props.size)}
      {...content}
    />
  );
}

/**
 * Test infra only, for `globals=renderer:headless` (set by e2e with `--renderer=headless`): every `Chart` of the
 * page shows what `renderChart` returns for it. The stories, their knobs and the sizes of their charts are the
 * ones of the other renderers, so the screenshots compare.
 *
 * It runs in the browser, so it shows what the markup looks like, not that producing it needs no DOM. Text is
 * measured as in the other renderers, by the browser in the font it draws with: with the width table of Inter
 * that Node uses, text would move in every story of a page that draws no Inter, and hide what else differs.
 * A component of a story that inserts its styles in an effect, as those of EUI do in a browser, shows unstyled.
 */
export function renderChartsHeadlessly(headless: boolean) {
  Chart.prototype.render = headless
    ? function render(this: Chart) {
        return rendering ? renderLive.call(this) : <HeadlessChart {...this.props} />;
      }
    : renderLive;
}
