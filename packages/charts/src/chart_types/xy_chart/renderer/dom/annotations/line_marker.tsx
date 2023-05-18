/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createPopper, Instance } from '@popperjs/core';
import React, { RefObject, useRef, useEffect, useCallback, CSSProperties } from 'react';

import { DEFAULT_CSS_CURSOR } from '../../../../../common/constants';
import {
  DOMElementType,
  onDOMElementEnter as onDOMElementEnterAction,
  onDOMElementLeave as onDOMElementLeaveAction,
  onDOMElementClick as onDOMElementClickAction,
} from '../../../../../state/actions/dom_element';
import { Position, renderWithProps } from '../../../../../utils/common';
import { Dimensions } from '../../../../../utils/dimensions';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnimationOptions } from '../../canvas/animations/animation';
import { GetAnnotationParamsFn } from '../../common/utils';

type LineMarkerProps = Pick<AnnotationLineProps, 'id' | 'specId' | 'datum' | 'panel'> & {
  marker: AnnotationLineProps['markers'][number];
  chartAreaRef: RefObject<HTMLCanvasElement>;
  chartDimensions: Dimensions;
  onDOMElementEnter: typeof onDOMElementEnterAction;
  onDOMElementLeave: typeof onDOMElementLeaveAction;
  onDOMElementClick: typeof onDOMElementClickAction;
  clickable: boolean;
  getHoverParams: GetAnnotationParamsFn;
};

const MARKER_TRANSFORMS = {
  [Position.Right]: 'translate(0%, -50%)',
  [Position.Left]: 'translate(-100%, -50%)',
  [Position.Top]: 'translate(-50%, -100%)',
  [Position.Bottom]: 'translate(-50%, 0%)',
};

function getMarkerCentredTransform(alignment: Position, hasMarkerDimensions: boolean): string | undefined {
  return hasMarkerDimensions ? undefined : MARKER_TRANSFORMS[alignment];
}

/**
 * LineMarker component used to display line annotation markers
 * @internal
 */
export function LineMarker({
  id,
  specId,
  datum,
  panel,
  marker: { icon, body, color, position, alignment, dimension },
  chartAreaRef,
  chartDimensions,
  onDOMElementEnter,
  onDOMElementLeave,
  onDOMElementClick,
  clickable,
  getHoverParams,
}: LineMarkerProps) {
  const { style, options } = getHoverParams(id);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const testRef = useRef<HTMLDivElement | null>(null);
  const popper = useRef<Instance | null>(null);
  const markerStyle: CSSProperties = {
    ...style,
    ...getAnimatedStyles(options, style),
    color,
    top: chartDimensions.top + position.top + panel.top,
    left: chartDimensions.left + position.left + panel.left,
    cursor: clickable ? 'pointer' : DEFAULT_CSS_CURSOR,
  };

  const transform = { transform: getMarkerCentredTransform(alignment, Boolean(dimension)) };
  const setPopper = useCallback(() => {
    if (!iconRef.current || !testRef.current) return;

    popper.current = createPopper(iconRef.current, testRef.current, {
      strategy: 'absolute',
      placement: alignment,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 0],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: chartAreaRef.current,
          },
        },
        {
          name: 'flip',
          options: {
            // prevents default flip modifier
            fallbackPlacements: [],
          },
        },
      ],
    });
  }, [chartAreaRef, alignment]);

  useEffect(() => {
    if (!popper.current && body) {
      setPopper();
    }

    return () => {
      popper?.current?.destroy?.();
      popper.current = null;
    };
  }, [setPopper, body]);

  void popper?.current?.update?.();

  // want it to be tabbable if interactive if there is a click handler
  return clickable ? (
    <button
      className="echAnnotation__marker"
      onMouseEnter={() => {
        onDOMElementEnter({
          createdBySpecId: specId,
          id,
          type: DOMElementType.LineAnnotationMarker,
          datum,
        });
      }}
      onMouseLeave={onDOMElementLeave}
      onClick={onDOMElementClick}
      style={{ ...markerStyle, ...transform }}
      type="button"
    >
      <div ref={iconRef} className="echAnnotation__icon">
        {renderWithProps(icon, datum)}
      </div>
      {body && (
        <div ref={testRef} className="echAnnotation__body">
          {renderWithProps(body, datum)}
        </div>
      )}
    </button>
  ) : (
    <div
      className="echAnnotation__marker"
      onMouseEnter={() => {
        onDOMElementEnter({
          createdBySpecId: specId,
          id,
          type: DOMElementType.LineAnnotationMarker,
          datum,
        });
      }}
      onMouseLeave={onDOMElementLeave}
      style={{ ...markerStyle, ...transform }}
    >
      <div ref={iconRef} className="echAnnotation__icon">
        {renderWithProps(icon, datum)}
      </div>
      {body && (
        <div ref={testRef} className="echAnnotation__body">
          {renderWithProps(body, datum)}
        </div>
      )}
    </div>
  );
}

function getAnimatedStyles(
  { duration, delay, timeFunction, snapValues = [], enabled }: AnimationOptions,
  { opacity }: CSSProperties,
): CSSProperties {
  if (!enabled || (typeof opacity === 'number' && snapValues.includes(opacity))) return {};
  return {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionProperty: 'opacity',
    transitionTimingFunction: timeFunction,
  };
}
