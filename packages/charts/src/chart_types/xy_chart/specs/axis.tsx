/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { SpecType } from '../../../specs/constants';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { Position } from '../../../utils/common';
import { AxisSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';

/** @public */
export const Axis: React.FunctionComponent<SpecRequired & SpecOptionals> = getConnect()(
  specComponentFactory<
    AxisSpec,
    'groupId' | 'hide' | 'showOverlappingTicks' | 'showOverlappingLabels' | 'position' | 'timeAxisLayerCount'
  >({
    chartType: ChartType.XYAxis,
    specType: SpecType.Axis,
    groupId: DEFAULT_GLOBAL_ID,
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Left,
    timeAxisLayerCount: 0,
  }),
);

type SpecRequired = Pick<AxisSpec, 'id'>;
type SpecOptionals = Partial<Omit<AxisSpec, 'chartType' | 'specType' | 'seriesType' | 'id'>>;
