/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentProps } from 'react';

import { SpecType } from '../../../specs';
import { SFProps } from '../../../state/build_props_types';
import { buildSFProps } from '../../../state/build_sf_props';
import { useSpecFactory } from '../../../state/spec_factory';
import { stripUndefined } from '../../../utils/common';
import { ChartType } from '../../chart_type';
import { LineAnnotationSpec, DEFAULT_GLOBAL_ID, AnnotationType } from '../utils/specs';

const buildProps = buildSFProps<LineAnnotationSpec>()(
  {
    chartType: ChartType.XYAxis,
    specType: SpecType.Annotation,
  },
  {
    groupId: DEFAULT_GLOBAL_ID,
    annotationType: AnnotationType.Line,
    hideLines: false,
    hideTooltips: false,
    zIndex: 1,
  },
);

/**
 * Adds bar series to chart specs
 * @public
 */
export const LineAnnotation = function <D = any>(
  props: SFProps<
    LineAnnotationSpec<D>,
    keyof (typeof buildProps)['overrides'],
    keyof (typeof buildProps)['defaults'],
    keyof (typeof buildProps)['optionals'],
    keyof (typeof buildProps)['requires']
  >,
) {
  const { defaults, overrides } = buildProps;
  useSpecFactory<LineAnnotationSpec<D>>({ ...defaults, ...stripUndefined(props), ...overrides });
  return null;
};

/** @public */
export type LineAnnotationProps = ComponentProps<typeof LineAnnotation>;
