/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { projectionToTickDimensions } from './projections';
import type { SettingsSpec, SmallMultiplesSpec } from '../../../specs';
import { getSmallMultiplesScale } from '../../../state/utils/get_small_multiples_scale';
import type { TextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { withTextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import type { ChartDimensions, Dimensions } from '../../../utils/dimensions';
import type { OrdinalDomain } from '../../../utils/domain';
import type { AxisId } from '../../../utils/ids';
import type { Theme, AxisStyle } from '../../../utils/themes/theme';
import { getAxesDimensions } from '../axes/layout/dimensions';
import { computeVisibleTickSets, type Projection } from '../axes/visible_ticks';
import type { AxesTicksDimensions, JoinedAxisData } from '../state/selectors/compute_axis_ticks_dimensions';
import type { ScaleConfigs } from '../state/selectors/get_api_scale_configs';
import type { SeriesDomainsAndData } from '../state/utils/types';
import type { AxesPerSide } from '../utils/dimensions';
import { computeChartArea } from '../utils/dimensions';
import type { AxisSpec } from '../utils/specs';

const MAX_ITERATIONS = 3;
const LAYOUT_EPSILON_PX = 0.5;
const MIN_PLOT_SIZE_PX = 1;

const plotAreaForProjection = (chartDimensions: Dimensions): Dimensions => ({
  ...chartDimensions,
  width: Math.max(chartDimensions.width, MIN_PLOT_SIZE_PX),
  height: Math.max(chartDimensions.height, MIN_PLOT_SIZE_PX),
});

/** @internal */
export type ChartLayout = {
  dimensions: ChartDimensions;
  ticks: Map<AxisId, Projection>;
  meta: {
    iterations: number;
  };
};

const projectTicks = (
  { settings, scales, axes, sm, bars, theme }: LayoutParameters,
  chartDimensions: Dimensions,
  textMeasure: TextMeasure,
) => {
  const plotArea = plotAreaForProjection(chartDimensions);
  return computeVisibleTickSets(
    textMeasure,
    settings,
    scales.configs,
    axes.data,
    scales.domains,
    {
      horizontal: getSmallMultiplesScale(sm.domains.smHDomain, plotArea.width, sm.spec?.style?.horizontalPanelPadding),
      vertical: getSmallMultiplesScale(sm.domains.smVDomain, plotArea.height, sm.spec?.style?.verticalPanelPadding),
    },
    bars.groupsCount,
    bars.enableHistogramMode,
    theme,
    bars.padding,
  );
};

/** @internal */
export type LayoutParameters = {
  container: Dimensions;
  theme: Theme;
  settings: SettingsSpec;
  scales: {
    configs: ScaleConfigs;
    domains: Pick<SeriesDomainsAndData, 'xDomain' | 'yDomains'>;
  };
  axes: {
    specs: AxisSpec[];
    styles: Map<AxisId, AxisStyle | null>;
    data: Map<AxisId, JoinedAxisData>;
  };
  sm: {
    spec: SmallMultiplesSpec | null;
    domains: {
      smHDomain: OrdinalDomain;
      smVDomain: OrdinalDomain;
    };
  };
  bars: {
    groupsCount: number;
    padding?: number;
    enableHistogramMode: boolean;
  };
  bootstrap: {
    tickDimensions: AxesTicksDimensions;
  };
};

const isLayoutStable = (a: AxesPerSide, b: AxesPerSide) => {
  return [
    Math.abs(a.top - b.top) <= LAYOUT_EPSILON_PX,
    Math.abs(a.bottom - b.bottom) <= LAYOUT_EPSILON_PX,
    Math.abs(a.left - b.left) <= LAYOUT_EPSILON_PX,
    Math.abs(a.right - b.right) <= LAYOUT_EPSILON_PX,
  ].every(Boolean);
};

/** @internal */
export function computeChartLayout(params: LayoutParameters): ChartLayout {
  const { container, theme, settings, scales, axes: axesConfig, sm, bootstrap } = params;
  return withTextMeasure((textMeasure) => {
    const initialAxes = axesConfig.specs.map((spec) => ({
      spec,
      style: axesConfig.styles.get(spec.id) ?? theme.axes,
      tickDimensions: bootstrap.tickDimensions.get(spec.id) ?? [],
      isHidden: spec.hide,
    }));

    const axesDimensions = getAxesDimensions(theme, initialAxes, sm.spec, scales.configs.x.type, settings.rotation);

    let margins = axesDimensions;
    let chartArea = computeChartArea(container, margins, theme);
    let projections: Map<AxisId, Projection> = new Map();

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const nextChartArea = computeChartArea(container, margins, theme);
      if (
        nextChartArea.chartDimensions.width < MIN_PLOT_SIZE_PX ||
        nextChartArea.chartDimensions.height < MIN_PLOT_SIZE_PX
      ) {
        if (projections.size > 0) {
          break;
        }
        return {
          dimensions: chartArea,
          ticks: projectTicks(params, plotAreaForProjection(chartArea.chartDimensions), textMeasure),
          meta: { iterations: 0 },
        };
      }
      const nextProjections = projectTicks(params, nextChartArea.chartDimensions, textMeasure);
      const nextTickDimensions = projectionToTickDimensions(nextProjections);
      const nextAxes = axesConfig.specs.map((spec) => ({
        spec,
        style: axesConfig.styles.get(spec.id) ?? theme.axes,
        tickDimensions: nextTickDimensions.get(spec.id) ?? [],
        isHidden: spec.hide,
      }));
      const nextMargins = getAxesDimensions(theme, nextAxes, sm.spec, scales.configs.x.type, settings.rotation);

      if (isLayoutStable(margins, nextMargins)) {
        return {
          dimensions: nextChartArea,
          ticks: nextProjections,
          meta: {
            iterations: i + 1,
          },
        };
      }
      margins = nextMargins;
      chartArea = nextChartArea;
      projections = nextProjections;
    }
    return {
      dimensions: chartArea,
      ticks: projections,
      meta: {
        iterations: MAX_ITERATIONS,
      },
    };
  });
}
