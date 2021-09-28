/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mergeOptionals, RecursivePartial } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { PartialTheme, Theme } from '../../../../utils/themes/theme';
import { Config } from '../../layout/types/config_types';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { GoalSpec } from '../../specs';

/**
 * Helper to map old config to theme
 * remove when `spec.config` is fully deprecated
 */
const mapConfigToTheme = ({
  margin,
  backgroundColor,
  minFontSize,
  maxFontSize,
  fontFamily,
}: RecursivePartial<Config> = {}): PartialTheme => ({
  chartMargins: margin,
  background: { color: backgroundColor },
  goal: {
    minFontSize,
    maxFontSize,
    tickLabel: { fontFamily },
    majorLabel: { fontFamily },
    minorLabel: { fontFamily },
  },
});

/** @internal */
export function render(spec: GoalSpec, parentDimensions: Dimensions, theme: Theme): ShapeViewModel {
  // override theme and spec with old deprecated config options
  const mergedTheme: Theme = mergeOptionals(theme, mapConfigToTheme(spec.config));
  const mergedSpec: GoalSpec = mergeOptionals(spec, {
    angleEnd: spec?.config?.angleEnd,
    angleStart: spec?.config?.angleStart,
  });
  return shapeViewModel(mergedSpec, mergedTheme, parentDimensions);
}
