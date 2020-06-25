/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { $Values } from 'utility-types';

import { ChartTypes } from '../chart_types';
import { Position } from '../utils/commons';
import { LIGHT_THEME } from '../utils/themes/light_theme';
import { SettingsSpec } from './settings';

export const SpecTypes = Object.freeze({
  Series: 'series' as const,
  Axis: 'axis' as const,
  Annotation: 'annotation' as const,
  Settings: 'settings' as const,
});
export type SpecTypes = $Values<typeof SpecTypes>;

export const PointerEventType = Object.freeze({
  Over: 'Over' as const,
  Out: 'Out' as const,
});
export type PointerEventType = $Values<typeof PointerEventType>;

/**
 * This enums provides the available tooltip types
 * @public
 */
export const TooltipType = Object.freeze({
  /** Vertical cursor parallel to x axis */
  VerticalCursor: 'vertical' as const,
  /** Vertical and horizontal cursors */
  Crosshairs: 'cross' as const,
  /** Follow the mouse coordinates */
  Follow: 'follow' as const,
  /** Hide every tooltip */
  None: 'none' as const,
});
/**
 * The TooltipType
 * @public
 */
export type TooltipType = $Values<typeof TooltipType>;

export const BrushAxis = Object.freeze({
  X: 'x' as const,
  Y: 'y' as const,
  Both: 'both' as const,
});
export type BrushAxis = $Values<typeof BrushAxis>;

/**
 * Default value for the tooltip type
 * @defaultValue `vertical` {@link (TooltipType:type) | TooltipType.VerticalCursor}
 * @public
 */
export const DEFAULT_TOOLTIP_TYPE = TooltipType.VerticalCursor;

/**
 * Default value for the tooltip snap
 * @defaultValue `true`
 * @public
 */
export const DEFAULT_TOOLTIP_SNAP = true;

export const DEFAULT_SETTINGS_SPEC: SettingsSpec = {
  id: '__global__settings___',
  chartType: ChartTypes.Global,
  specType: SpecTypes.Settings,
  rendering: 'canvas' as const,
  rotation: 0 as const,
  animateData: true,
  showLegend: false,
  resizeDebounce: 10,
  debug: false,
  tooltip: {
    type: DEFAULT_TOOLTIP_TYPE,
    snap: DEFAULT_TOOLTIP_SNAP,
  },
  externalPointerEvents: {
    tooltip: {
      visible: false,
    },
  },
  legendPosition: Position.Right,
  showLegendExtra: false,
  hideDuplicateAxes: false,
  theme: LIGHT_THEME,
  brushAxis: BrushAxis.X,
  minBrushDelta: 2,
};
