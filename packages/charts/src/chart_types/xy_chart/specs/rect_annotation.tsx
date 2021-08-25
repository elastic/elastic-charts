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
import { specComponentFactory, getConnect } from '../../../state/spec_factory';
import { DEFAULT_ANNOTATION_RECT_STYLE } from '../../../utils/themes/merge_utils';
import { RectAnnotationSpec, DEFAULT_GLOBAL_ID, AnnotationType } from '../utils/specs';

const defaultProps = {
  chartType: ChartType.XYAxis,
  specType: SpecType.Annotation,
  groupId: DEFAULT_GLOBAL_ID,
  annotationType: AnnotationType.Rectangle,
  zIndex: -1,
  style: DEFAULT_ANNOTATION_RECT_STYLE,
  outside: false,
  lineAnnotationBorder: null,
};

/** @public */
export const RectAnnotation: React.FunctionComponent<
  Pick<RectAnnotationSpec, 'id' | 'dataValues'> &
    Partial<
      Omit<
        RectAnnotationSpec,
        | 'chartType'
        | 'specType'
        | 'seriesType'
        | 'id'
        | 'dataValues'
        | 'domainType'
        | 'annotationType'
        | 'lineAnnotationBorder'
      >
    >
> = getConnect()(
  specComponentFactory<RectAnnotationSpec, 'groupId' | 'annotationType' | 'zIndex' | 'style'>(defaultProps),
);
