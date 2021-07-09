/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentType } from 'react';

import { TooltipValue } from '../../specs';

/**
 * The set of info used to render the a tooltip.
 * @public
 */
export interface TooltipInfo {
  /**
   * The TooltipValue for the header. On XYAxis chart the x value
   */
  header: TooltipValue | null;
  /**
   * The array of {@link TooltipValue}s to show on the tooltip.
   * On XYAxis chart correspond to the set of y values for each series
   */
  values: TooltipValue[];
}

/**
 * The react component used to render a custom tooltip
 * with the {@link TooltipInfo} props
 * @public
 */
export type CustomTooltip = ComponentType<TooltipInfo>;
