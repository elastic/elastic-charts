/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { ChartType } from '../..';
import { FontStyle } from '../../../common/text_utils';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { RecursivePartial } from '../../../utils/common';
import { config } from '../layout/config/config';
import {
  WordModel,
  defaultWordcloudSpec,
  WeightFn,
  OutOfRoomCallback,
  Configs as WordcloudConfigs,
} from '../layout/types/viewmodel_types';

const defaultProps = {
  chartType: ChartType.Wordcloud,
  specType: SpecType.Series,
  ...defaultWordcloudSpec,
  config,
};

export { WeightFn };
export type { WordModel, WordcloudConfigs, OutOfRoomCallback };

/** @alpha */
export interface WordcloudSpec extends Spec {
  specType: typeof SpecType.Series;
  chartType: typeof ChartType.Wordcloud;
  config: RecursivePartial<WordcloudConfigs>;
  startAngle: number;
  endAngle: number;
  angleCount: number;
  padding: number;
  fontWeight: number;
  fontFamily: string;
  fontStyle: FontStyle;
  minFontSize: number;
  maxFontSize: number;
  spiral: string;
  exponent: number;
  data: WordModel[];
  weightFn: WeightFn;
  outOfRoomCallback: OutOfRoomCallback;
}

type SpecRequiredProps = Pick<WordcloudSpec, 'id'>;
type SpecOptionalProps = Partial<Omit<WordcloudSpec, 'chartType' | 'specType' | 'id'>>;

/** @alpha */
export const Wordcloud: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<
    WordcloudSpec,
    | 'chartType'
    | 'startAngle'
    | 'config'
    | 'endAngle'
    | 'angleCount'
    | 'padding'
    | 'fontWeight'
    | 'fontFamily'
    | 'fontStyle'
    | 'minFontSize'
    | 'maxFontSize'
    | 'spiral'
    | 'exponent'
    | 'data'
    | 'weightFn'
    | 'outOfRoomCallback'
  >(defaultProps),
);
