/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean } from '@storybook/addon-knobs';

import type { LineSeriesProps } from '@elastic/charts';

// it overrides the style of no point; the same function on every render, so the spec doesn't change with it
const noPointStyleOverride = () => null;

/** The knob that tells whether the series of a story are M4 downsampled, which they are by default */
export const getM4Knob = () => boolean('M4 downsampling', true);

/**
 * The props that keep a series from being M4 downsampled, or none if it is to be downsampled. No option turns the
 * downsampling off, but a series with a point style accessor is never downsampled, and this one changes no point.
 */
export const m4SeriesProps = (downsample: boolean): Pick<LineSeriesProps, 'pointStyleAccessor'> =>
  downsample ? {} : { pointStyleAccessor: noPointStyleOverride };
