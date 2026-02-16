/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { computeAxesGeometriesSelector } from './compute_axes_geometries';
import { computeSeriesDomainsSelector } from './compute_series_domains';
import { axisSpecsLookupSelector } from './get_specs';
import { generateTicks } from './visible_ticks';
import type { PerPanelMap, SmallMultipleScales } from '../../../../common/panel_utils';
import { getPanelTitle, getPerPanelMap, hasSMDomain } from '../../../../common/panel_utils';
import { ScaleContinuous } from '../../../../scales';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { computeSmallMultipleScalesSelector } from '../../../../state/selectors/compute_small_multiple_scales';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getSmallMultiplesIndexOrderSelector } from '../../../../state/selectors/get_small_multiples_index_order';
import { getSmallMultiplesSpec } from '../../../../state/selectors/get_small_multiples_spec';
import type { Position } from '../../../../utils/common';
import type { YDomain } from '../../domains/types';
import { isHorizontalAxis, isVerticalAxis } from '../../utils/axis_type_utils';
import type { AxisGeometry, AxisTick } from '../../utils/axis_utils';
import { defaultTickFormatter, isXDomain } from '../../utils/axis_utils';
import type { AxisSpec } from '../../utils/specs';

/** @internal */
export type PerPanelAxisGeoms = {
  axesGeoms: AxisGeometry[];
} & PerPanelMap;

const isPrimaryColumnFn =
  ({ horizontal: { domain } }: SmallMultipleScales) =>
  (position: Position, horizontalValue: any) =>
    isVerticalAxis(position) && domain[0] === horizontalValue;

const isPrimaryRowFn =
  ({ vertical: { domain } }: SmallMultipleScales) =>
  (position: Position, verticalValue: any) =>
    isHorizontalAxis(position) && domain[0] === verticalValue;

/**
 * Regenerates Y-axis ticks for a specific panel using the per-panel Y domain.
 * Creates a new ScaleContinuous from the panel domain and generates tick values/labels.
 */
function regenerateYAxisTicks(
  geom: AxisGeometry,
  panelYDomain: YDomain,
  panelHeight: number,
  axisSpec: AxisSpec | undefined,
): AxisTick[] {
  const range: [number, number] = [panelHeight, 0];
  const scale = new ScaleContinuous(
    { type: panelYDomain.type, domain: panelYDomain.domain, range, nice: panelYDomain.nice },
    {
      desiredTickCount: panelYDomain.desiredTickCount,
      logBase: panelYDomain.logBase,
      logMinLimit: panelYDomain.logMinLimit,
      domainPixelPadding: panelYDomain.domainPixelPadding,
      constrainDomainPadding: panelYDomain.constrainDomainPadding,
    },
  );

  const ticks = scale.ticks();
  const labelFormatter = axisSpec?.tickFormat ?? defaultTickFormatter;

  return generateTicks(scale, ticks, 0, labelFormatter, undefined, 0, true, false);
}

/** @internal */
export const computePerPanelAxesGeomsSelector = createCustomCachedSelector(
  [
    computeAxesGeometriesSelector,
    computeSmallMultipleScalesSelector,
    getSmallMultiplesIndexOrderSelector,
    computeSeriesDomainsSelector,
    getSmallMultiplesSpec,
    axisSpecsLookupSelector,
    getSettingsSpecSelector,
  ],
  (axesGeoms, scales, groupBySpec, seriesDomains, smSpec, axisSpecsLookup, settingsSpec): Array<PerPanelAxisGeoms> => {
    const { horizontal, vertical } = scales;
    const isPrimaryColumn = isPrimaryColumnFn(scales);
    const isPrimaryRow = isPrimaryRowFn(scales);
    const { yDomainsPerPanel } = seriesDomains;
    const independentYDomain = smSpec?.independentYDomain === true && yDomainsPerPanel !== undefined;
    const chartRotation = settingsSpec.rotation;

    return getPerPanelMap(scales, (_, h, v) => ({
      axesGeoms: axesGeoms.map((geom) => {
        const { position, id } = geom.axis;
        const isVertical = isVerticalAxis(position);
        const usePanelTitle = isVertical ? hasSMDomain(vertical) : hasSMDomain(horizontal);
        const panelTitle = usePanelTitle ? getPanelTitle(isVertical, v, h, groupBySpec) : undefined;
        const secondary = !isPrimaryColumn(position, h) && !isPrimaryRow(position, v);

        if (!independentYDomain || isXDomain(position, chartRotation)) {
          const updatedAxis = { ...geom.axis, panelTitle, secondary };
          return { ...geom, axis: updatedAxis };
        }

        const axisSpec = axisSpecsLookup.get(id);
        const panelKey = [v, h].join('|');
        const panelYDomains = yDomainsPerPanel.get(panelKey);
        const panelYDomain = panelYDomains?.find((yd: YDomain) => yd.groupId === axisSpec?.groupId);

        if (!panelYDomain) {
          const updatedAxis = { ...geom.axis, panelTitle, secondary };
          return { ...geom, axis: updatedAxis };
        }

        // When independentYDomain is active, force secondary to false for Y-axes
        // so that each panel renders its own tick marks and labels
        const updatedAxis = { ...geom.axis, panelTitle, secondary: false };
        const panelHeight = vertical.bandwidth;
        const visibleTicks = regenerateYAxisTicks(geom, panelYDomain, panelHeight, axisSpec);

        return { ...geom, axis: updatedAxis, visibleTicks };
      }),
    }));
  },
);
