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
import { ChartType } from '../../chart_type';
import { RectAnnotationSpec, DEFAULT_GLOBAL_ID, AnnotationType } from '../utils/specs';

/** @public */
export const RectAnnotation = specComponentFactory<RectAnnotationSpec>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Annotation,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    annotationType: AnnotationType.Rectangle,
    zIndex: -1,
    outside: false,
  },
);

/** @public */
export type RectAnnotationProps = ComponentProps<typeof RectAnnotation>;
