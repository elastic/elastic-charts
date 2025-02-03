/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { Spec } from '../../../specs/spec';
import { SpecType } from '../../../specs/spec_type';
import { specComponentFactory } from '../../../state/spec_factory';
import { ChartType } from '../../chart_type';
import { defaultWordcloudSpec, WordcloudViewModel } from '../layout/types/viewmodel_types';

/** @alpha */
export interface WordcloudSpec extends Spec, WordcloudViewModel {
  chartType: typeof ChartType.Wordcloud;
  specType: typeof SpecType.Series;
}

/**
 * Adds wordcloud spec to chart
 * @alpha
 */
export const Wordcloud = specComponentFactory<WordcloudSpec>()(
  {
    chartType: ChartType.Wordcloud,
    specType: SpecType.Series,
  },
  {
    ...defaultWordcloudSpec,
  },
);

/** @public */
export type WordcloudProps = ComponentProps<typeof Wordcloud>;

export { WordModel, WeightFn, OutOfRoomCallback } from '../layout/types/viewmodel_types';
