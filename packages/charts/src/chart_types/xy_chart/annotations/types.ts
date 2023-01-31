/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentType, ReactNode } from 'react';

import { AnnotationLineProps } from './line/types';
import { AnnotationRectProps } from './rect/types';
import { Color } from '../../../common/colors';
import { TooltipPortalSettings } from '../../../components/portal';
import { Position } from '../../../utils/common';
import { AnnotationId, SpecId } from '../../../utils/ids';
import { AnnotationType, LineAnnotationDatum, RectAnnotationDatum } from '../utils/specs';

/** @public */
export type AnnotationTooltipFormatter = ComponentType<{ details?: string }>;

/** @public */
export type CustomAnnotationTooltip = ComponentType<{
  header?: string;
  details?: string;
  datum: LineAnnotationDatum | RectAnnotationDatum;
}> | null;

/**
 * The header and description strings for an Annotation
 * @internal
 */
export interface AnnotationDetails {
  headerText?: string;
  detailsText?: string;
}

/**
 * Component to render based on annotation datum
 *
 * @public
 */
export type ComponentWithAnnotationDatum<D = any> = ComponentType<LineAnnotationDatum<D>>;

/**
 * The marker for an Annotation. Usually a JSX element
 * @internal
 */
export interface AnnotationMarker {
  icon?: ReactNode | ComponentWithAnnotationDatum;
  position: {
    top: number;
    left: number;
  };
  dimension?: {
    width: number;
    height: number;
  };
  body?: ReactNode | ComponentWithAnnotationDatum;
  alignment: Position;
  color: Color;
}

/** @internal */
export interface AnnotationTooltipState {
  id: AnnotationId;
  specId: SpecId;
  isVisible: true;
  annotationType: AnnotationType;
  datum: LineAnnotationDatum | RectAnnotationDatum;
  anchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  customTooltipDetails?: AnnotationTooltipFormatter;
  customTooltip?: CustomAnnotationTooltip;
  tooltipSettings?: TooltipPortalSettings<'chart'>;
}

/** @internal */
export type AnnotationDimensions = Array<AnnotationLineProps | AnnotationRectProps>;

/** @internal */
export type Bounds = {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};
