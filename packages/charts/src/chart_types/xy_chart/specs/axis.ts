/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { ChartType } from '../..';
import { SpecType } from '../../../specs/constants';
import { specComponentFactory } from '../../../state/spec_factory';
import { Position, type RecursivePartial } from '../../../utils/common';
import type { AxisStyle } from '../../../utils/themes/theme';
import { AxisSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';

/** @internal */
const MULTILAYER_TIME_AXIS_STYLE: RecursivePartial<AxisStyle> = {
  tickLabel: {
    visible: true,
    padding: 0,
    rotation: 0,
    alignment: {
      vertical: Position.Bottom,
      horizontal: Position.Left,
    },
  },
  tickLine: {
    visible: true,
    size: 0,
    padding: 4,
  },
};

/**
 * Add axis spec to chart
 * @public
 */
export const Axis = specComponentFactory<AxisSpec>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Axis,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Left,
    style: MULTILAYER_TIME_AXIS_STYLE,
    timeAxisLayerCount: 2,
  },
);

/** @public */
export type AxisProps = ComponentProps<typeof Axis>;
