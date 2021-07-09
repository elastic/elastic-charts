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
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../../../utils/themes/merge_utils';
import { LineAnnotationSpec, DEFAULT_GLOBAL_ID, AnnotationType } from '../utils/specs';

const defaultProps = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Annotation,
  groupId: DEFAULT_GLOBAL_ID,
  annotationType: AnnotationType.Line,
  style: DEFAULT_ANNOTATION_LINE_STYLE,
  hideLines: false,
  hideTooltips: false,
  hideLinesTooltips: true,
  zIndex: 1,
};

type SpecRequiredProps = Pick<LineAnnotationSpec, 'id' | 'dataValues' | 'domainType'>;
type SpecOptionalProps = Partial<
  Omit<
    LineAnnotationSpec,
    'chartType' | 'specType' | 'seriesType' | 'id' | 'dataValues' | 'domainType' | 'annotationType'
  >
>;

/** @public */
export const LineAnnotation: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<LineAnnotationSpec, 'groupId' | 'annotationType' | 'zIndex' | 'style'>(defaultProps),
);
