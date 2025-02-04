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

import { AnnotationTooltip } from './annotation_tooltip';
import { LineMarker } from './line_marker';
import {
  onDOMElementEnter as onDOMElementEnterAction,
  onDOMElementLeave as onDOMElementLeaveAction,
  onDOMElementClick as onDOMElementClickAction,
  onDOMElementClick,
} from '../../../../../state/actions/dom_element';
import { onPointerMove as onPointerMoveAction } from '../../../../../state/actions/mouse';
import { GlobalChartState } from '../../../../../state/chart_state';
import { BackwardRef } from '../../../../../state/internal_chart_state';
import { getChartThemeSelector } from '../../../../../state/selectors/get_chart_theme';
import {
  getInternalIsInitializedSelector,
  InitStatus,
} from '../../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../../state/selectors/get_settings_spec';
import { Dimensions } from '../../../../../utils/dimensions';
import { AnnotationId } from '../../../../../utils/ids';
import { LIGHT_THEME } from '../../../../../utils/themes/light_theme';
import { SharedGeometryStateStyle } from '../../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../../annotations/line/types';
import { AnnotationDimensions, AnnotationTooltipState } from '../../../annotations/types';
import { computeAnnotationDimensionsSelector } from '../../../state/selectors/compute_annotations';
import { computeChartDimensionsSelector } from '../../../state/selectors/compute_chart_dimensions';
import { getAnnotationTooltipStateSelector } from '../../../state/selectors/get_annotation_tooltip_state';
import { getHighlightedAnnotationIdsSelector } from '../../../state/selectors/get_highlighted_annotation_ids_selector';
import { getAnnotationSpecsSelector } from '../../../state/selectors/get_specs';
import { isChartEmptySelector } from '../../../state/selectors/is_chart_empty';
import { getSpecsById } from '../../../state/utils/spec';
import { isLineAnnotation, AnnotationSpec, AnnotationAnimationConfig } from '../../../utils/specs';
import { getAnnotationHoverParamsFn } from '../../common/utils';

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
  sharedStyle: SharedGeometryStateStyle;
  annotationSpecs: AnnotationSpec[];
  chartId: string;
  zIndex: number;
  hoveredAnnotationIds: string[];
  clickable: boolean;
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
  hoveredIds: string[],
  sharedStyle: SharedGeometryStateStyle,
  clickable: boolean,
  animations?: AnnotationAnimationConfig[],
) {
  const getHoverParams = getAnnotationHoverParamsFn(hoveredIds, sharedStyle, animations);
  return annotationLines.reduce<JSX.Element[]>((acc, { markers, ...props }: AnnotationLineProps) => {
    if (!markers[0]) return acc;

    acc.push(
      <LineMarker
        {...props}
        marker={markers[0]}
        key={`annotation-${props.id}`}
        chartAreaRef={chartAreaRef}
        chartDimensions={chartDimensions}
        onDOMElementEnter={onDOMElementEnter}
        onDOMElementLeave={onDOMElementLeave}
        onDOMElementClick={onDOMElementClick}
        clickable={clickable}
        getHoverParams={getHoverParams}
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
  clickable,
  hoveredAnnotationIds,
  sharedStyle,
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
          hoveredAnnotationIds,
          sharedStyle,
          clickable,
          annotationSpec.animations,
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
    hoveredAnnotationIds,
    sharedStyle,
    clickable,
  ]);

  const onScroll = useCallback(() => {
    onPointerMove({ position: { x: -1, y: -1 }, time: Date.now() });
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
      sharedStyle: LIGHT_THEME.sharedStyle,
      annotationDimensions: new Map(),
      annotationSpecs: [],
      tooltipState: null,
      chartId,
      zIndex,
      hoveredAnnotationIds: [],
      clickable: false,
    };
  }
  return {
    isChartEmpty: isChartEmptySelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    sharedStyle: getChartThemeSelector(state).sharedStyle,
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    tooltipState: getAnnotationTooltipStateSelector(state),
    chartId,
    zIndex,
    hoveredAnnotationIds: getHighlightedAnnotationIdsSelector(state),
    clickable: Boolean(getSettingsSpecSelector(state).onAnnotationClick),
  };
};

/** @internal */
export const Annotations = connect(mapStateToProps, mapDispatchToProps)(AnnotationsComponent);
