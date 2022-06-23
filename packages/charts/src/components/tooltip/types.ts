/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentType, ReactNode } from 'react';

import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, TooltipValue, TooltipValueFormatter } from '../../specs';
import { Datum } from '../../utils/common';

/**
 * The set of info used to render the a tooltip.
 * @public
 */
export interface TooltipInfo<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
  /**
   * The TooltipValue for the header. On XYAxis chart the x value
   */
  header: TooltipValue<D, SI> | null;
  /**
   * The array of {@link TooltipValue}s to show on the tooltip.
   * On XYAxis chart correspond to the set of y values for each series
   */
  values: TooltipValue<D, SI>[];
}

/**
 * The set of info used to render the a tooltip.
 * @public
 */
export interface CustomTooltipProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>
  extends TooltipInfo<D, SI> {
  headerFormatter?: TooltipValueFormatter;
  className?: string;
  dir: 'ltr' | 'rtl';
  backgroundColor: string;
}

/**
 * The react component used to render a custom tooltip
 * @public
 */
export type CustomTooltip = ComponentType<CustomTooltipProps>;

/** @internal */
export type PropsOrChildren<P, C extends Record<string, unknown> = Record<string, any>> =
  | P
  | ({
      children: ReactNode;
    } & C);
