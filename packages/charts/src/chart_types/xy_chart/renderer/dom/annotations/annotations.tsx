/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject, useCallback } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { AnnotationClickListener } from '../../../../../specs';
import {
  onDOMElementEnter as onDOMElementEnterAction,
  onDOMElementLeave as onDOMElementLeaveAction,
  onDOMElementClick as onDOMElementClickAction,
  onDOMElementClick,
} from '../../../../../state/actions/dom_element';
import { onPointerMove as onPointerMoveAction } from '../../../../../state/actions/mouse';
import { GlobalChartState, BackwardRef } from '../../../../../state/chart_state';
import {
  getInternalIsInitializedSelector,
  InitStatus,
} from '../../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../../state/selectors/get_settings_specs';
import { Dimensions } from '../../../../../utils/dimensions';
import { AnnotationId } from '../../../../../utils/ids';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnnotationDimensions, AnnotationTooltipState } from '../../../annotations/types';
import { computeAnnotationDimensionsSelector } from '../../../state/selectors/compute_annotations';
import { computeChartDimensionsSelector } from '../../../state/selectors/compute_chart_dimensions';
import { getAnnotationTooltipStateSelector } from '../../../state/selectors/get_annotation_tooltip_state';
import { getAnnotationSpecsSelector } from '../../../state/selectors/get_specs';
import { isChartEmptySelector } from '../../../state/selectors/is_chart_empty';
import { getSpecsById } from '../../../state/utils/spec';
import { isLineAnnotation, AnnotationSpec } from '../../../utils/specs';
import { AnnotationTooltip } from './annotation_tooltip';
import { LineMarker } from './line_marker';

interface AnnotationsDispatchProps {
  onPointerMove: typeof onPointerMoveAction;
  onDOMElementEnter: typeof onDOMElementEnterAction;
  onDOMElementLeave: typeof onDOMElementLeaveAction;
}

interface AnnotationsStateProps {
  isChartEmpty: boolean;
  tooltipState: AnnotationTooltipState | null;
  chartDimensions: Dimensions;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
  chartId: string;
  zIndex: number;
  onAnnotationClick?: AnnotationClickListener;
}

interface AnnotationsOwnProps {
  getChartContainerRef: BackwardRef;
  chartAreaRef: RefObject<HTMLCanvasElement>;
}

type AnnotationsProps = AnnotationsDispatchProps & AnnotationsStateProps & AnnotationsOwnProps;

function renderAnnotationLineMarkers(
  chartAreaRef: RefObject<HTMLCanvasElement>,
  chartDimensions: Dimensions,
  annotationLines: AnnotationLineProps[],
  onDOMElementEnter: typeof onDOMElementEnterAction,
  onDOMElementLeave: typeof onDOMElementLeaveAction,
  onAnnotationClick?: AnnotationClickListener,
) {
  return annotationLines.reduce<JSX.Element[]>((acc, props: AnnotationLineProps) => {
    if (props.markers.length === 0) {
      return acc;
    }
    acc.push(
      <LineMarker
        {...props}
        key={`annotation-${props.id}`}
        chartAreaRef={chartAreaRef}
        chartDimensions={chartDimensions}
        onDOMElementEnter={onDOMElementEnter}
        onDOMElementLeave={onDOMElementLeave}
        onDOMElementClick={onDOMElementClick}
        annotationSpec={onAnnotationClick}
      />,
    );

    return acc;
  }, []);
}
const AnnotationsComponent = ({
  tooltipState,
  isChartEmpty,
  chartDimensions,
  annotationSpecs,
  annotationDimensions,
  getChartContainerRef,
  chartAreaRef,
  chartId,
  zIndex,
  onPointerMove,
  onDOMElementEnter,
  onDOMElementLeave,
  onAnnotationClick,
}: AnnotationsProps) => {
  const renderAnnotationMarkers = useCallback((): JSX.Element[] => {
    const markers: JSX.Element[] = [];

    annotationDimensions.forEach((dimensions: AnnotationDimensions, id: AnnotationId) => {
      const annotationSpec = getSpecsById<AnnotationSpec>(annotationSpecs, id);
      if (!annotationSpec) {
        return;
      }

      if (isLineAnnotation(annotationSpec)) {
        const annotationLines = dimensions as AnnotationLineProps[];
        const lineMarkers = renderAnnotationLineMarkers(
          chartAreaRef,
          chartDimensions,
          annotationLines,
          onDOMElementEnter,
          onDOMElementLeave,
          onAnnotationClick,
        );
        lineMarkers.forEach((m) => markers.push(m));
      }
    });

    return markers;
  }, [
    annotationDimensions,
    annotationSpecs,
    chartAreaRef,
    chartDimensions,
    onDOMElementEnter,
    onDOMElementLeave,
    onAnnotationClick,
  ]);

  const onScroll = useCallback(() => {
    onPointerMove({ x: -1, y: -1 }, Date.now());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isChartEmpty) {
    return null;
  }

  return (
    <>
      {renderAnnotationMarkers()}
      <AnnotationTooltip
        chartId={chartId}
        zIndex={zIndex}
        state={tooltipState}
        chartRef={getChartContainerRef()}
        onScroll={onScroll}
      />
    </>
  );
};

AnnotationsComponent.displayName = 'Annotations';

const mapDispatchToProps = (dispatch: Dispatch): AnnotationsDispatchProps =>
  bindActionCreators(
    {
      onPointerMove: onPointerMoveAction,
      onDOMElementLeave: onDOMElementLeaveAction,
      onDOMElementEnter: onDOMElementEnterAction,
      onDOMElementClick: onDOMElementClickAction,
    },
    dispatch,
  );

const mapStateToProps = (state: GlobalChartState): AnnotationsStateProps => {
  const { zIndex, chartId } = state;
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      isChartEmpty: true,
      chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
      annotationDimensions: new Map(),
      annotationSpecs: [],
      tooltipState: null,
      chartId,
      zIndex,
      onAnnotationClick: undefined,
    };
  }
  return {
    isChartEmpty: isChartEmptySelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    tooltipState: getAnnotationTooltipStateSelector(state),
    chartId,
    zIndex,
    onAnnotationClick: getSettingsSpecSelector(state).onAnnotationClick,
  };
};

/** @internal */
export const Annotations = connect(mapStateToProps, mapDispatchToProps)(AnnotationsComponent);
