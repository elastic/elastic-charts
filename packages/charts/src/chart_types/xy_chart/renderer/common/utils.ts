/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AnimationConfig, AnnotationAnimationTrigger } from './../../utils/specs';
import { mergePartial } from '../../../../utils/common';
import { GeometryStateStyle, SharedGeometryStateStyle } from '../../../../utils/themes/theme';
import { TimeFunction } from '../../../../utils/time_functions';
import { AnimationOptions } from '../canvas/animations/animation';

const DEFAULT_ANNOTATION_ANIMATION_OPTIONS: AnimationOptions = {
  enabled: true,
  duration: 250,
  delay: 50,
  snapValues: [],
  timeFunction: TimeFunction.easeInOut,
};

/** @internal */
export interface AnnotationHoverParams {
  style: GeometryStateStyle;
  isHighlighted: boolean;
  shouldTransition: boolean;
  options: AnimationOptions;
}

/** @internal */
export type GetAnnotationParamsFn = (id: string) => AnnotationHoverParams;

/**
 * Returns function to get geometry styles for a given id
 * @internal
 */
export const getAnnotationHoverParamsFn =
  (
    hoveredElementIds: string[],
    styles: SharedGeometryStateStyle,
    animations: AnimationConfig<AnnotationAnimationTrigger>[] = [],
  ): GetAnnotationParamsFn =>
  (id) => {
    const fadeOutConfig = animations.find(({ trigger }) => trigger === AnnotationAnimationTrigger.FadeOnFocusingOthers);
    const isHighlighted = hoveredElementIds.includes(id);
    const style =
      hoveredElementIds.length === 0 || !fadeOutConfig
        ? styles.default
        : isHighlighted
          ? styles.highlighted
          : styles.unhighlighted;
    const shouldTransition = !isHighlighted && hoveredElementIds.length > 0;

    return {
      style,
      isHighlighted,
      shouldTransition,
      options: mergePartial(DEFAULT_ANNOTATION_ANIMATION_OPTIONS, fadeOutConfig?.options),
    };
  };
