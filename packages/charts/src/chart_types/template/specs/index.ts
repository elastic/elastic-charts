/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { ChartType } from '../..';
import { Spec, SpecType } from '../../../specs';
import { buildSFProps, SFProps, useSpecFactory } from '../../../state/spec_factory';
import { stripUndefined } from '../../../utils/common';

/** @internal */
export interface NewVizSpec extends Spec {
  specType: typeof SpecType.Series;
  // TODO add a new ChartType to ../../../index.ts
  chartType: typeof ChartType.NewViz;
  data: number;
}

const buildProps = buildSFProps<NewVizSpec>()(
  {
    chartType: ChartType.NewViz,
    specType: SpecType.Series,
  },
  {
    data: 100,
  },
);

/**
 * Adds bar series to chart specs
 * @public
 */
export const NewViz = function (
  props: SFProps<
    NewVizSpec,
    keyof typeof buildProps['overrides'],
    keyof typeof buildProps['defaults'],
    keyof typeof buildProps['optionals'],
    keyof typeof buildProps['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<NewVizSpec>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type NewVizSpecProps = ComponentProps<typeof NewViz>;
