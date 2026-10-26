/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getBulletSpec } from './get_bullet_spec';
import { getLayout } from './get_layout';
import { createCustomCachedSelector } from '../../../state/create_selector';
import type { Size } from '../../../utils/dimensions';
import { BulletSubtype } from '../spec';
import { getAngularAspectFallback, getMinAngularChartSize } from '../utils/angular';

/** @internal */
export interface BulletRenderMode {
  /** Subtype actually rendered, degraded from `BulletSpec.subtype` when the panel aspect ratio is not compatible */
  subtype: BulletSubtype;
  /** Whether to render a metric instead of the chart */
  shouldRenderMetric: boolean;
}

const minLinearChartSizes: Record<Extract<BulletSubtype, 'horizontal' | 'vertical'>, Size> = {
  [BulletSubtype.horizontal]: { width: 140, height: 50 },
  [BulletSubtype.vertical]: { width: 140, height: 100 },
};

const getMinChartSize = (subtype: BulletSubtype): Size =>
  subtype === BulletSubtype.horizontal || subtype === BulletSubtype.vertical
    ? minLinearChartSizes[subtype]
    : getMinAngularChartSize(subtype);

const getEffectiveSubtype = (subtype: BulletSubtype, graphSize: Size): BulletSubtype =>
  subtype === BulletSubtype.horizontal || subtype === BulletSubtype.vertical
    ? subtype
    : getAngularAspectFallback(graphSize, subtype) ?? subtype;

/**
 * Resolves how the chart is rendered. If too small to render the chart, renders a metric instead.
 * In the angular subtype cases, if the graph aspect ratio tall/wide to fit the angular aspect ratio, degrades to a
 * linear subtype.
 * @internal
 */
export const getRenderMode = createCustomCachedSelector(
  [getLayout, getBulletSpec],
  ({ panel, layoutAlignment }, spec): BulletRenderMode => {
    const maxHeaderHeight = layoutAlignment.reduce((acc, { headerHeight }) => Math.max(acc, headerHeight), 0);

    const subtype = getEffectiveSubtype(spec.subtype, {
      width: panel.width,
      height: panel.height - maxHeaderHeight,
    });

    const minChartSize = getMinChartSize(subtype);
    const minHeight = layoutAlignment.reduce((acc, { headerHeight }) => acc + headerHeight + minChartSize.height, 0);

    const shouldRenderMetric = panel.height * layoutAlignment.length <= minHeight || panel.width <= minChartSize.width;

    return { subtype, shouldRenderMetric };
  },
);
