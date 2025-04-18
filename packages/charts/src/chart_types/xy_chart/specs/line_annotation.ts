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
import { stripUndefined } from '../../../utils/common';
import type { LineAnnotationSpec } from '../utils/specs';
import { DEFAULT_GLOBAL_ID, AnnotationType } from '../utils/specs';

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
