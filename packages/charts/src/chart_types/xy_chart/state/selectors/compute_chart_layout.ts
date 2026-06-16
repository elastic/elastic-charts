/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxesTicksDimensions, JoinedAxisData } from './compute_baseline_axes';
import { computeBaselineAxisTicksDimensionsSelector, getJoinedVisibleAxesData } from './compute_baseline_axes';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { countBarsInClusterSelector } from './count_bars_in_cluster';
import type { ScaleConfigs } from './get_api_scale_configs';
import { getScaleConfigsFromSpecsSelector } from './get_api_scale_configs';
import { getBarPaddingsSelector } from './get_bar_paddings';
import { getAxisSpecsSelector } from './get_specs';
import { isHistogramModeEnabledSelector } from './is_histogram_mode_enabled';
import type { AxisSpec, SettingsSpec, SmallMultiplesSpec } from '../../../../specs';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalSmallMultiplesDomains } from '../../../../state/selectors/get_internal_sm_domains';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import { getSmallMultiplesScale } from '../../../../state/utils/get_small_multiples_scale';
import { withTextMeasure, type TextMeasure } from '../../../../utils/bbox/canvas_text_bbox_calculator';
import type { ChartDimensions, Dimensions, PerSideDistance } from '../../../../utils/dimensions';
import type { OrdinalDomain } from '../../../../utils/domain';
import type { AxisId } from '../../../../utils/ids';
import type { Theme } from '../../../../utils/themes/theme';
import { getAxesDimensions } from '../../axes/dimensions';
import type { Projection } from '../../axes/ticks/types';
import { computeVisibleTickSets } from '../../axes/ticks/visible_ticks';
import { computeChartArea } from '../../utils/dimensions';
import type { SeriesDomainsAndData } from '../utils/types';

const MAX_ITERATIONS = 5;
const LAYOUT_EPSILON_PX = 0.5;

/** @internal */
export type AxesPerSide = PerSideDistance & { margin: { left: number } };

/** @internal */
export type ChartLayout = {
  dimensions: ChartDimensions;
  ticks: Map<AxisId, Projection>;
  meta: {
    iterations: number;
  };
};

const projectionToTickDimensions = (projections: Map<AxisId, Projection>): AxesTicksDimensions => {
  const tickDimensions = new Map();
  projections.forEach(({ ticks }, id) => {
    tickDimensions.set(
      id,
      ticks.map((tick) => tick.layout),
    );
  });
  return tickDimensions;
};

const projectTicks = (
  { settings, scales, axes, sm, bars }: LayoutParameters,
  chartDimensions: Dimensions,
  textMeasure: TextMeasure,
) => {
  return computeVisibleTickSets(
    textMeasure,
    settings,
    scales.configs,
    axes.data,
    scales.domains,
    {
      horizontal: getSmallMultiplesScale(
        sm.domains.smHDomain,
        chartDimensions.width,
        sm.spec?.style?.horizontalPanelPadding,
      ),
      vertical: getSmallMultiplesScale(
        sm.domains.smVDomain,
        chartDimensions.height,
        sm.spec?.style?.verticalPanelPadding,
      ),
    },
    bars.groupsCount,
    bars.enableHistogramMode,
    chartDimensions.width,
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
  const { container, theme, axes: axesConfig, bootstrap } = params;
  return withTextMeasure((textMeasure) => {
    const measureMargins = (tickDimensions: AxesTicksDimensions) => {
      const axes = axesConfig.specs.flatMap((spec) => {
        const joined = axesConfig.data.get(spec.id);
        if (!joined) return [];
        return [
          {
            spec,
            style: joined.axesStyle,
            ticks: tickDimensions.get(spec.id) ?? [],
            layout: joined.layout,
            isHidden: spec.hide,
          },
        ];
      });
      return getAxesDimensions(theme, axes);
    };

    let projections = projectTicks(
      params,
      computeChartArea(container, measureMargins(bootstrap.tickDimensions), theme).chartDimensions,
      textMeasure,
    );

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const margins = measureMargins(projectionToTickDimensions(projections));
      const chartArea = computeChartArea(container, margins, theme);
      const nextProjections = projectTicks(params, chartArea.chartDimensions, textMeasure);
      const nextMargins = measureMargins(projectionToTickDimensions(nextProjections));

      if (isLayoutStable(margins, nextMargins)) {
        return {
          dimensions: computeChartArea(container, nextMargins, theme),
          ticks: nextProjections,
          meta: { iterations: i + 1 },
        };
      }
      projections = nextProjections;
    }

    const finalMargins = measureMargins(projectionToTickDimensions(projections));
    return {
      dimensions: computeChartArea(container, finalMargins, theme),
      ticks: projections,
      meta: { iterations: MAX_ITERATIONS },
    };
  });
}

/** @internal */
export const computeChartLayoutSelector = createCustomCachedSelector(
  [
    getChartContainerDimensionsSelector,
    getChartThemeSelector,
    getSettingsSpecSelector,
    getScaleConfigsFromSpecsSelector,
    getAxisSpecsSelector,
    getJoinedVisibleAxesData,
    computeSeriesDomainsSelector,
    getSmallMultiplesSpec,
    getInternalSmallMultiplesDomains,
    countBarsInClusterSelector,
    isHistogramModeEnabledSelector,
    getBarPaddingsSelector,
    computeBaselineAxisTicksDimensionsSelector,
  ],
  (
    container,
    theme,
    settings,
    scales,
    axes,
    joined,
    domains,
    sm,
    smDomains,
    groups,
    enableHistogramMode,
    barPadding,
    bootstrapTickDimensions,
  ) => {
    const params: LayoutParameters = {
      container,
      theme,
      settings,
      scales: { configs: scales, domains },
      axes: { specs: axes, data: joined },
      sm: { spec: sm, domains: smDomains },
      bars: { groupsCount: groups, enableHistogramMode, padding: barPadding },
      bootstrap: { tickDimensions: bootstrapTickDimensions },
    };
    return computeChartLayout(params);
  },
);
