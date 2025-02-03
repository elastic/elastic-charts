/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { SpecType } from '../../../specs/spec_type';
import { specComponentFactory } from '../../../state/spec_factory';
import { Position } from '../../../utils/common';
import { ChartType } from '../../chart_type';
import { AxisSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';

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
    timeAxisLayerCount: 0,
  },
);

/** @public */
export type AxisProps = ComponentProps<typeof Axis>;
