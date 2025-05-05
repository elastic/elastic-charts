/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ComponentProps } from 'react';

import { ChartType } from '../..';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { SFProps } from '../../../state/spec_factory';
import { buildSFProps, useSpecFactory } from '../../../state/spec_factory';
import { Position, stripUndefined } from '../../../utils/common';
import type { AxisSpec } from '../utils/specs';
import { DEFAULT_GLOBAL_ID } from '../utils/specs';

const buildProps = buildSFProps<AxisSpec>()(
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
    timeAxisLayerCount: 2,
  },
);

/** @internal */
export const Axis = function (
  props: SFProps<
    AxisSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  useSpecFactory<AxisSpec>(getAxisSpec(props));
  return null;
};

/** @internal */
export type AxisProps = ComponentProps<typeof Axis>;

/** @internal */
export function getAxisSpec(
  props: SFProps<
    AxisSpec,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
): AxisSpec {
  const { defaults, overrides } = buildProps;
  return { ...defaults, ...stripUndefined(props), ...overrides };
}
