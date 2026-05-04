/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Instance } from '@popperjs/core';
import { createPopper } from '@popperjs/core';
import type { RefObject, CSSProperties, HTMLAttributes } from 'react';
import React, { useRef, useEffect, useCallback, useMemo } from 'react';

import { getAnnotationTooltipDomId } from './annotation_tooltip';
import { DEFAULT_CSS_CURSOR } from '../../../../../common/constants';
import type {
  onDOMElementEnter as onDOMElementEnterAction,
  onDOMElementLeave as onDOMElementLeaveAction,
  onDOMElementClick as onDOMElementClickAction,
} from '../../../../../state/actions/dom_element';
import { DOMElementType } from '../../../../../state/actions/dom_element';
import { Position, renderWithProps } from '../../../../../utils/common';
import type { Dimensions } from '../../../../../utils/dimensions';
import type { AnnotationLineProps } from '../../../annotations/line/types';
import type { AnimationOptions } from '../../canvas/animations/animation';
import type { GetAnnotationParamsFn } from '../../common/utils';

type LineMarkerProps = Pick<AnnotationLineProps, 'id' | 'specId' | 'datum' | 'panel'> & {
  chartId: string;
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
  chartId,
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

  const handleEnter = useCallback(() => {
    onDOMElementEnter({
      createdBySpecId: specId,
      id,
      type: DOMElementType.LineAnnotationMarker,
      datum,
    });
  }, [onDOMElementEnter, specId, id, datum]);

  const elementProps: HTMLAttributes<HTMLDivElement> & HTMLAttributes<HTMLButtonElement> = useMemo(() => {
    const markerStyle: CSSProperties = {
      ...style,
      ...getAnimatedStyles(options, style),
      color,
      top: chartDimensions.top + position.top + panel.top,
      left: chartDimensions.left + position.left + panel.left,
      cursor: clickable ? 'pointer' : DEFAULT_CSS_CURSOR,
    };

    const transform = { transform: getMarkerCentredTransform(alignment, Boolean(dimension)) };

    const ariaLabel = datum.ariaLabel ?? datum.details ?? datum.header ?? `line annotation ${datum.dataValue}`;
    const tooltipDomId = getAnnotationTooltipDomId(chartId, id);

    return {
      className: 'echAnnotation__marker',
      'data-testid': 'echAnnotationMarker',
      onMouseEnter: handleEnter,
      onMouseLeave: () => onDOMElementLeave(),
      onFocus: handleEnter,
      onBlur: () => onDOMElementLeave(),
      onKeyDown: (e) => {
        if (e.key === 'Escape') {
          onDOMElementLeave();
        }
      },
      style: { ...markerStyle, ...transform },
      'aria-describedby': tooltipDomId,
      'aria-label': ariaLabel,
    };
  }, [
    handleEnter,
    onDOMElementLeave,
    color,
    chartDimensions,
    position,
    panel,
    clickable,
    style,
    options,
    alignment,
    dimension,
    id,
    chartId,
    datum,
  ]);

  return clickable ? (
    <button {...elementProps} onClick={() => onDOMElementClick()} type="button">
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
    // Non-clickable markers use a div (not a button) so they are not exposed as controls,
    // but they still need tabIndex={0} so keyboard users can focus the marker for tooltip / hover state
    // and Escape to dismiss.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div {...elementProps} tabIndex={0}>
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
