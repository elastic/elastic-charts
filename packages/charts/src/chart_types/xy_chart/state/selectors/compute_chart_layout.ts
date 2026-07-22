/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AxesTicksDimensions, AxisTicksDimension, JoinedAxisData } from './compute_baseline_axes';
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
import type { ChartDimensions, Dimensions } from '../../../../utils/dimensions';
import type { OrdinalDomain } from '../../../../utils/domain';
import type { AxisId } from '../../../../utils/ids';
import type { Theme } from '../../../../utils/themes/theme';
import { getAxesDimensions } from '../../axes/dimensions';
import type { Projection } from '../../axes/ticks/types';
import { computeVisibleTickSets } from '../../axes/ticks/visible_ticks';
import type { AxesPerSide } from '../../utils/dimensions';
import { computeChartArea } from '../../utils/dimensions';
import type { SeriesDomainsAndData } from '../utils/types';

const MAX_ITERATIONS = 5;
const LAYOUT_EPSILON_PX = 0.5;

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
    bars.padding,
  );
};

type LayoutParameters = {
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

function computeChartLayout(params: LayoutParameters): {
  dimensions: ChartDimensions;
  ticks: Map<AxisId, Projection>;
  meta: {
    iterations: number;
  };
} {
  const { container, theme, axes: axesConfig, bootstrap } = params;
  return withTextMeasure((textMeasure) => {
    const measureMargins = (measures: Map<AxisId, Projection | AxisTicksDimension>) => {
      const axes = axesConfig.specs.flatMap((spec) => {
        const joined = axesConfig.data.get(spec.id);
        if (!joined) return [];
        const measure = measures.get(spec.id);
        const ticks = measure && 'ticks' in measure ? measure.ticks : undefined;
        const layouts =
          measure && 'ticks' in measure ? measure.ticks.map((tick) => tick.layout) : measure?.layouts ?? [];
        return [
          {
            spec,
            style: joined.axesStyle,
            layouts,
            ticks,
            layout: joined.layout,
            scale: measure?.scale ?? joined.scale,
            isHidden: spec.hide,
          },
        ];
      });
      return getAxesDimensions(theme, axes);
    };

    const finalLayout = (margins: AxesPerSide, iterations: number) => {
      const dimensions = computeChartArea(container, margins, theme);
      return {
        dimensions,
        ticks: projectTicks(params, dimensions.chartDimensions, textMeasure),
        meta: { iterations },
      };
    };

    let projections = projectTicks(
      params,
      computeChartArea(container, measureMargins(bootstrap.tickDimensions), theme).chartDimensions,
      textMeasure,
    );

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const margins = measureMargins(projections);
      const chartArea = computeChartArea(container, margins, theme);
      const nextProjections = projectTicks(params, chartArea.chartDimensions, textMeasure);
      const nextMargins = measureMargins(nextProjections);

      if (isLayoutStable(margins, nextMargins)) {
        return finalLayout(nextMargins, i + 1);
      }
      // Logger.warn('Layout did not converge after', i + 1, 'iterations');
      projections = nextProjections;
    }

    return finalLayout(measureMargins(projections), MAX_ITERATIONS);
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
