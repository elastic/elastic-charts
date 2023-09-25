/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getHeatmapSpecSelector } from './get_heatmap_spec';
import { Color } from '../../../../common/colors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getBandsColorScale } from '../../scales/band_color_scale';
import { ColorBand } from '../../specs/heatmap';

/** @internal */
export type ColorScale = (value: number) => Color;

/**
 * @internal
 * Gets color scale based on specification and values range.
 */
export const getColorScale = createCustomCachedSelector(
  [getSettingsSpecSelector, getHeatmapSpecSelector],
  (
    { locale },
    spec,
  ): {
    scale: ColorScale;
    bands: Required<ColorBand>[];
  } => getBandsColorScale(spec.colorScale, locale, spec.valueFormatter),
);
