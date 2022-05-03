/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartActions } from './chart';
import { ChartSettingsActions } from './chart_settings';
import { ColorsActions } from './colors';
import { EventsActions } from './events';
import { HoverActions } from './hover';
import { KeyActions } from './key';
import { LegendActions } from './legend';
import { MouseActions } from './mouse';
import { SpecActions } from './specs';
import { ZIndexActions } from './z_index';

/** @internal */
export type StateActions =
  | SpecActions
  | ChartActions
  | HoverActions
  | ChartSettingsActions
  | LegendActions
  | EventsActions
  | MouseActions
  | KeyActions
  | ColorsActions
  | ZIndexActions;
