/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartThemeSelector } from './get_chart_theme';
import { colorToRgba, RGBATupleToString } from '../../common/color_library_wrappers';
import { Color, Colors } from '../../common/colors';
import { TRANSPARENT_LIMIT } from '../../common/fill_text_color';
import { createCustomCachedSelector } from '../create_selector';

/**
 * @internal
 */
export const getResolvedBackgroundColorSelector = createCustomCachedSelector(
  [getChartThemeSelector],
  ({ background: { fallbackColor, color = Colors.Transparent.keyword } }): Color => {
    let backgroundRGBA = colorToRgba(color);

    if (backgroundRGBA[3] < TRANSPARENT_LIMIT) {
      backgroundRGBA = colorToRgba(fallbackColor);
    }

    return RGBATupleToString(backgroundRGBA);
  },
);
