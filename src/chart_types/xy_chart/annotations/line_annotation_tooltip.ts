import {
  AnnotationDomainType,
  AnnotationDomainTypes,
  AnnotationTypes,
  Position,
  Rotation,
  LineAnnotationSpec,
  LineAnnotationDatum,
  AxisSpec,
} from '../utils/specs';
import {
  AnnotationTooltipState,
  AnnotationDetails,
  AnnotationMarker,
  scaleAndValidateDatum,
  isXDomain,
  getRotatedCursor,
} from './annotation_utils';
import { isHorizontalRotation, getAxesSpecForSpecId } from '../state/utils';
import { isHorizontalAxis } from '../utils/axis_utils';
import { Dimensions } from '../../../utils/dimensions';
import { Scale } from '../../../utils/scales/scales';
import { GroupId } from '../../../utils/ids';
import { LineAnnotationStyle } from '../../../utils/themes/theme';
import { Point } from '../../../utils/point';

export type AnnotationLinePosition = [number, number, number, number];

export interface AnnotationLineProps {
  position: AnnotationLinePosition;
  tooltipLinePosition: AnnotationLinePosition;
  details: AnnotationDetails;
  marker?: AnnotationMarker;
}

interface TransformPosition {
  xPosition: number;
  yPosition: number;
  xOffset: number;
  yOffset: number;
}
export const DEFAULT_LINE_OVERFLOW = 0;

export function computeYDomainLineAnnotationDimensions(
  dataValues: LineAnnotationDatum[],
  yScale: Scale,
  chartRotation: Rotation,
  lineOverflow: number,
  axisPosition: Position,
  chartDimensions: Dimensions,
  lineColor: string,
  marker?: JSX.Element,
  markerDimensions?: { width: number; height: number },
): AnnotationLineProps[] {
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const markerOffsets = markerDimensions || { width: 0, height: 0 };
  const lineProps: AnnotationLineProps[] = [];

  dataValues.forEach((datum: LineAnnotationDatum) => {
    const { dataValue } = datum;
    const details = {
      detailsText: datum.details,
      headerText: datum.header || dataValue.toString(),
    };

    // d3.scale will return 0 for '', rendering the line incorrectly at 0
    if (dataValue === '') {
      return;
    }

    const scaledYValue = yScale.scale(dataValue);
    if (isNaN(scaledYValue)) {
      return;
    }

    const [domainStart, domainEnd] = yScale.domain;
    if (domainStart > dataValue || domainEnd < dataValue) {
      return;
    }

    const yDomainPosition = scaledYValue;

    const leftHorizontalAxis: AnnotationLinePosition = [0 - lineOverflow, yDomainPosition, chartWidth, yDomainPosition];
    const rightHorizontaAxis: AnnotationLinePosition = [0, yDomainPosition, chartWidth + lineOverflow, yDomainPosition];

    // Without overflow applied
    const baseLinePosition: AnnotationLinePosition = isHorizontalChartRotation
      ? [0, yDomainPosition, chartWidth, yDomainPosition]
      : [yDomainPosition, 0, yDomainPosition, chartHeight];

    const linePosition: AnnotationLinePosition = isHorizontalChartRotation
      ? axisPosition === Position.Left
        ? leftHorizontalAxis
        : rightHorizontaAxis
      : [0, yDomainPosition, chartHeight + lineOverflow, yDomainPosition];

    const markerPosition: AnnotationLinePosition = isHorizontalChartRotation
      ? ([...linePosition] as AnnotationLinePosition)
      : [yDomainPosition, 0, yDomainPosition, chartHeight + lineOverflow];

    if (isHorizontalChartRotation) {
      if (axisPosition === Position.Left) {
        markerPosition[0] -= markerOffsets.width;
      } else {
        markerPosition[2] += markerOffsets.width;
      }
      if (chartRotation === 180) {
        markerPosition[1] = chartHeight - markerPosition[1];
        markerPosition[3] = chartHeight - markerPosition[3];
      }
    } else {
      markerPosition[3] += markerOffsets.height;
      if (chartRotation === 90) {
        markerPosition[0] = chartWidth - markerPosition[0];
        markerPosition[2] = chartWidth - markerPosition[2];
      }
    }

    const markerTransform = getAnnotationLineTooltipTransform(chartRotation, markerPosition, axisPosition);
    const annotationMarker = marker
      ? { icon: marker, transform: markerTransform, color: lineColor, dimensions: markerOffsets }
      : undefined;
    const lineProp = {
      position: linePosition,
      details,
      marker: annotationMarker,
      tooltipLinePosition: baseLinePosition,
    };

    lineProps.push(lineProp);
  });

  return lineProps;
}

export function computeXDomainLineAnnotationDimensions(
  dataValues: LineAnnotationDatum[],
  xScale: Scale,
  chartRotation: Rotation,
  lineOverflow: number,
  axisPosition: Position,
  chartDimensions: Dimensions,
  lineColor: string,
  xScaleOffset: number,
  enableHistogramMode: boolean,
  marker?: JSX.Element,
  markerDimensions?: { width: number; height: number },
): AnnotationLineProps[] {
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;
  const markerOffsets = markerDimensions || { width: 0, height: 0 };
  const lineProps: AnnotationLineProps[] = [];

  const alignWithTick = xScale.bandwidth > 0 && !enableHistogramMode;
  dataValues.forEach((datum: LineAnnotationDatum) => {
    const { dataValue } = datum;
    const details = {
      detailsText: datum.details,
      headerText: datum.header || dataValue.toString(),
    };

    const offset = xScale.bandwidth / 2 - xScaleOffset;

    const scaledXValue = scaleAndValidateDatum(dataValue, xScale, alignWithTick);

    if (scaledXValue == null) {
      return;
    }

    const xDomainPosition = scaledXValue + offset;

    let linePosition: AnnotationLinePosition = [0, 0, 0, 0];
    let tooltipLinePosition: AnnotationLinePosition = [0, 0, 0, 0];
    let markerPosition: AnnotationLinePosition = [0, 0, 0, 0];

    switch (chartRotation) {
      case 0: {
        const startY = axisPosition === Position.Bottom ? 0 : -lineOverflow;
        const endY = axisPosition === Position.Bottom ? chartHeight + lineOverflow : chartHeight;
        linePosition = [xDomainPosition, startY, xDomainPosition, endY];
        tooltipLinePosition = [xDomainPosition, 0, xDomainPosition, chartHeight];

        const startMarkerY = axisPosition === Position.Bottom ? 0 : -lineOverflow - markerOffsets.height;
        const endMarkerY =
          axisPosition === Position.Bottom ? chartHeight + lineOverflow + markerOffsets.height : chartHeight;
        markerPosition = [xDomainPosition, startMarkerY, xDomainPosition, endMarkerY];
        break;
      }
      case 90: {
        linePosition = [xDomainPosition, -lineOverflow, xDomainPosition, chartWidth];
        tooltipLinePosition = [0, xDomainPosition, chartWidth, xDomainPosition];

        const markerStartX = -lineOverflow - markerOffsets.width;
        markerPosition = [markerStartX, xDomainPosition, chartWidth, xDomainPosition];
        break;
      }
      case -90: {
        linePosition = [xDomainPosition, -lineOverflow, xDomainPosition, chartWidth];
        tooltipLinePosition = [0, chartHeight - xDomainPosition, chartWidth, chartHeight - xDomainPosition];

        const markerStartX = -lineOverflow - markerOffsets.width;
        markerPosition = [markerStartX, chartHeight - xDomainPosition, chartWidth, chartHeight - xDomainPosition];
        break;
      }
      case 180: {
        const startY = axisPosition === Position.Bottom ? 0 : -lineOverflow;
        const endY = axisPosition === Position.Bottom ? chartHeight + lineOverflow : chartHeight;
        linePosition = [xDomainPosition, startY, xDomainPosition, endY];
        tooltipLinePosition = [xDomainPosition, 0, xDomainPosition, chartHeight];

        const startMarkerY = axisPosition === Position.Bottom ? 0 : -lineOverflow - markerOffsets.height;
        const endMarkerY =
          axisPosition === Position.Bottom ? chartHeight + lineOverflow + markerOffsets.height : chartHeight;
        markerPosition = [chartWidth - xDomainPosition, startMarkerY, chartWidth - xDomainPosition, endMarkerY];
        break;
      }
    }

    const markerTransform = getAnnotationLineTooltipTransform(chartRotation, markerPosition, axisPosition);
    const annotationMarker = marker
      ? { icon: marker, transform: markerTransform, color: lineColor, dimensions: markerOffsets }
      : undefined;
    const lineProp = { position: linePosition, details, marker: annotationMarker, tooltipLinePosition };
    lineProps.push(lineProp);
  });

  return lineProps;
}

export function computeLineAnnotationDimensions(
  annotationSpec: LineAnnotationSpec,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  axisPosition: Position,
  xScaleOffset: number,
  enableHistogramMode: boolean,
): AnnotationLineProps[] | null {
  const { domainType, dataValues, marker, markerDimensions, hideLines } = annotationSpec;

  if (hideLines) {
    return null;
  }

  // TODO : make line overflow configurable via prop
  const lineOverflow = DEFAULT_LINE_OVERFLOW;

  // this type is guaranteed as this has been merged with default
  const lineStyle = annotationSpec.style as LineAnnotationStyle;
  const lineColor = lineStyle.line.stroke;

  if (domainType === AnnotationDomainTypes.XDomain) {
    return computeXDomainLineAnnotationDimensions(
      dataValues,
      xScale,
      chartRotation,
      lineOverflow,
      axisPosition,
      chartDimensions,
      lineColor,
      xScaleOffset,
      enableHistogramMode,
      marker,
      markerDimensions,
    );
  }

  const groupId = annotationSpec.groupId;
  const yScale = yScales.get(groupId);
  if (!yScale) {
    return null;
  }

  return computeYDomainLineAnnotationDimensions(
    dataValues,
    yScale,
    chartRotation,
    lineOverflow,
    axisPosition,
    chartDimensions,
    lineColor,
    marker,
    markerDimensions,
  );
}
export function getLineAnnotationTooltipState(
  line: AnnotationLineProps,
  chartRotation: Rotation,
  axisPosition: Position,
  domainType: AnnotationDomainType,
  chartDimensions: Dimensions,
): AnnotationTooltipState {
  const chartWidth = chartDimensions.width;
  const chartHeight = chartDimensions.height;

  const annotationTooltipState: AnnotationTooltipState = {
    isVisible: false,
    transform: '',
    annotationType: AnnotationTypes.Line,
  };
  annotationTooltipState.isVisible = true;

  // Position tooltip based on axis position & lineOffset amount
  const [tooltipStartX, tooltipStartY, tooltipEndX, tooltipEndY] = line.tooltipLinePosition;
  const tooltipLinePosition: AnnotationLinePosition = [tooltipStartX, tooltipStartY, tooltipEndX, tooltipEndY];

  annotationTooltipState.transform = getAnnotationLineTooltipTransform(
    chartRotation,
    tooltipLinePosition,
    axisPosition,
  );

  if (chartRotation === 180 && domainType === AnnotationDomainTypes.YDomain) {
    const flippedYDomainTooltipLinePosition: AnnotationLinePosition = [
      tooltipStartX,
      chartHeight - tooltipStartY,
      tooltipEndX,
      chartHeight - tooltipEndY,
    ];

    annotationTooltipState.transform = getAnnotationLineTooltipTransform(
      chartRotation,
      flippedYDomainTooltipLinePosition,
      axisPosition,
    );
  }
  if (chartRotation === 180 && domainType === AnnotationDomainTypes.XDomain) {
    const rotatedXDomainTooltipLinePosition: AnnotationLinePosition = [
      chartWidth - tooltipStartX,
      tooltipStartY,
      chartWidth - tooltipEndX,
      tooltipEndY,
    ];
    annotationTooltipState.transform = getAnnotationLineTooltipTransform(
      chartRotation,
      rotatedXDomainTooltipLinePosition,
      axisPosition,
    );
  }
  if (chartRotation === 90 && domainType === AnnotationDomainTypes.YDomain) {
    const rotatedYDomainTooltipLinePosition: AnnotationLinePosition = [
      chartWidth - tooltipStartX,
      tooltipStartY,
      chartWidth - tooltipEndX,
      tooltipEndY,
    ];

    annotationTooltipState.transform = getAnnotationLineTooltipTransform(
      chartRotation,
      rotatedYDomainTooltipLinePosition,
      axisPosition,
    );
  }

  if (line.details) {
    annotationTooltipState.header = line.details.headerText;
    annotationTooltipState.details = line.details.detailsText;
  }
  return annotationTooltipState;
}

export function getAnnotationLineTooltipPosition(
  chartRotation: Rotation,
  linePosition: AnnotationLinePosition,
  axisPosition: Position,
): TransformPosition {
  const [startX, startY, endX, endY] = linePosition;

  const xPosition = axisPosition === Position.Right ? endX : startX;
  const yPosition = axisPosition === Position.Top ? startY : endY;

  const xOffset = getAnnotationLineTooltipXOffset(chartRotation, axisPosition);
  const yOffset = getAnnotationLineTooltipYOffset(chartRotation, axisPosition);

  return { xPosition, yPosition, xOffset, yOffset };
}

export function getAnnotationLineTooltipTransform(
  chartRotation: Rotation,
  linePosition: AnnotationLinePosition,
  axisPosition: Position,
): string {
  const position = getAnnotationLineTooltipPosition(chartRotation, linePosition, axisPosition);

  return toTransformString(position);
}

export function getAnnotationLineTooltipXOffset(chartRotation: Rotation, axisPosition: Position): number {
  let xOffset = 0;
  const isChartHorizontalRotation = isHorizontalRotation(chartRotation);

  if (isHorizontalAxis(axisPosition)) {
    xOffset = isChartHorizontalRotation ? 50 : 0;
  } else {
    xOffset = isChartHorizontalRotation ? (axisPosition === Position.Right ? 100 : 0) : 50;
  }

  return xOffset;
}

export function getAnnotationLineTooltipYOffset(chartRotation: Rotation, axisPosition: Position): number {
  let yOffset = 0;
  const isChartHorizontalRotation = isHorizontalRotation(chartRotation);

  if (isHorizontalAxis(axisPosition)) {
    yOffset = isChartHorizontalRotation ? (axisPosition === Position.Top ? 0 : 100) : 50;
  } else {
    yOffset = isChartHorizontalRotation ? 50 : 100;
  }

  return yOffset;
}

export function toTransformString(position: TransformPosition): string {
  const { xPosition, yPosition, xOffset, yOffset } = position;

  const xTranslation = `calc(${xPosition}px - ${xOffset}%)`;
  const yTranslation = `calc(${yPosition}px - ${yOffset}%)`;

  return `translate(${xTranslation},${yTranslation})`;
}

export function isWithinLineBounds(
  axisPosition: Position,
  linePosition: AnnotationLinePosition,
  rawCursorPosition: Point,
  offset: number,
  chartRotation: Rotation,
  chartDimensions: Dimensions,
  domainType: AnnotationDomainType,
  marker?: AnnotationMarker,
  hideLinesTooltips?: boolean,
): boolean {
  const [startX, startY, endX, endY] = linePosition;
  const isXDomainAnnotation = isXDomain(domainType);
  const cursorPosition = getRotatedCursor(rawCursorPosition, chartDimensions, chartRotation);

  let isCursorWithinXBounds = false;
  let isCursorWithinYBounds = false;

  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const chartWidth = chartDimensions.width;
  const chartHeight = chartDimensions.height;
  if (!hideLinesTooltips) {
    if (isXDomainAnnotation) {
      isCursorWithinXBounds = isHorizontalChartRotation
        ? cursorPosition.x >= startX - offset && cursorPosition.x <= endX + offset
        : cursorPosition.x >= chartHeight - startX - offset && cursorPosition.x <= chartHeight - endX + offset;
      isCursorWithinYBounds = isHorizontalChartRotation
        ? cursorPosition.y >= startY && cursorPosition.y <= endY
        : cursorPosition.y >= startY - offset && cursorPosition.y <= endY + offset;
    } else {
      isCursorWithinXBounds = isHorizontalChartRotation
        ? cursorPosition.x >= startX && cursorPosition.x <= endX
        : cursorPosition.x >= startX - offset && cursorPosition.x <= endX + offset;
      isCursorWithinYBounds = isHorizontalChartRotation
        ? cursorPosition.y >= startY - offset && cursorPosition.y <= endY + offset
        : cursorPosition.y >= chartWidth - startY - offset && cursorPosition.y <= chartWidth - endY + offset;
    }
    // If it's within cursor bounds, return true (no need to check marker bounds)
    if (isCursorWithinXBounds && isCursorWithinYBounds) {
      return true;
    }
  }

  if (!marker) {
    return false;
  }

  // Check if cursor within marker bounds
  let isCursorWithinMarkerXBounds = false;
  let isCursorWithinMarkerYBounds = false;

  const markerWidth = marker.dimensions.width;
  const markerHeight = marker.dimensions.height;
  const markerWidthOffset = offset + markerWidth / 2;
  const markerHeightOffset = offset + markerHeight / 2;

  if (isXDomainAnnotation) {
    const bottomAxisYBounds =
      chartRotation === 0
        ? cursorPosition.y <= endY + markerHeight && cursorPosition.y >= endY
        : cursorPosition.y >= startY - markerHeight && cursorPosition.y <= startY;
    const topAxisYBounds =
      chartRotation === 0
        ? cursorPosition.y >= startY - markerHeight && cursorPosition.y <= startY
        : cursorPosition.y <= endY + markerHeight && cursorPosition.y >= endY;

    isCursorWithinMarkerXBounds = isHorizontalChartRotation
      ? cursorPosition.x <= endX + markerWidthOffset && cursorPosition.x >= startX - markerWidthOffset
      : cursorPosition.x >= startX - markerWidthOffset && cursorPosition.x <= startX + markerWidthOffset;
    isCursorWithinMarkerYBounds = isHorizontalChartRotation
      ? axisPosition === Position.Top
        ? topAxisYBounds
        : bottomAxisYBounds
      : cursorPosition.y >= startY - markerHeightOffset && cursorPosition.y <= endY + markerHeightOffset;
  } else {
    const leftAxisXBounds =
      chartRotation === 0
        ? cursorPosition.x >= startX - markerWidth && cursorPosition.x <= startX
        : cursorPosition.x <= endX + markerWidth && cursorPosition.x >= endX;

    const rightAxisXBounds =
      chartRotation === 0
        ? cursorPosition.x <= endX + markerWidth && cursorPosition.x >= endX
        : cursorPosition.x >= startX - markerWidth && cursorPosition.x <= startX;

    isCursorWithinMarkerXBounds = isHorizontalChartRotation
      ? axisPosition === Position.Right
        ? rightAxisXBounds
        : leftAxisXBounds
      : cursorPosition.x <= endX + offset + markerWidth && cursorPosition.x >= startX - offset - markerWidth;
    isCursorWithinMarkerYBounds = isHorizontalChartRotation
      ? cursorPosition.y >= startY - markerHeightOffset && cursorPosition.y <= endY + markerHeightOffset
      : cursorPosition.y >= chartWidth - startY - markerHeightOffset &&
        cursorPosition.y <= chartWidth - endY + markerHeightOffset;
  }

  return isCursorWithinMarkerXBounds && isCursorWithinMarkerYBounds;
}

export function isVerticalAnnotationLine(isXDomainAnnotation: boolean, isHorizontalChartRotation: boolean): boolean {
  if (isXDomainAnnotation) {
    return isHorizontalChartRotation;
  }

  return !isHorizontalChartRotation;
}

export function getLineAnnotationTooltipStateFromCursor(
  cursorPosition: Point,
  annotationLines: AnnotationLineProps[],
  groupId: GroupId,
  domainType: AnnotationDomainType,
  style: LineAnnotationStyle,
  chartRotation: Rotation,
  chartDimensions: Dimensions,
  axesSpecs: AxisSpec[],
  hideLinesTooltips?: boolean,
): AnnotationTooltipState {
  const annotationTooltipState: AnnotationTooltipState = {
    isVisible: false,
    transform: '',
    annotationType: AnnotationTypes.Line,
  };

  const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, groupId);
  const isXDomainAnnotation = isXDomain(domainType);
  const annotationAxis = isXDomainAnnotation ? xAxis : yAxis;

  if (!annotationAxis) {
    return annotationTooltipState;
  }

  const axisPosition = annotationAxis.position;

  for (let i = 0; i < annotationLines.length; i++) {
    const line = annotationLines[i];
    const lineOffset = style.line.strokeWidth / 2;
    const isWithinBounds = isWithinLineBounds(
      axisPosition,
      line.position,
      cursorPosition,
      lineOffset,
      chartRotation,
      chartDimensions,
      domainType,
      line.marker,
      hideLinesTooltips,
    );

    if (isWithinBounds) {
      return getLineAnnotationTooltipState(line, chartRotation, axisPosition, domainType, chartDimensions);
    }
  }

  return annotationTooltipState;
}
