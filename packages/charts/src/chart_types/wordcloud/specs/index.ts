/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ComponentProps } from 'react';

import { ChartType } from '../..';
import type { Spec } from '../../../specs/spec_type';
import { SpecType } from '../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { specComponentFactory } from '../../../state/spec_factory';
import type { WordcloudViewModel } from '../layout/types/viewmodel_types';
import { defaultWordcloudSpec } from '../layout/types/viewmodel_types';

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
