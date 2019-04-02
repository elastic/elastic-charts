import { isHorizontal } from '../lib/axes/axis_utils';
import {
  AnnotationDatum,
  AnnotationDomainType,
  AnnotationSpec,
  AnnotationType,
  AxisSpec,
  Position,
  Rotation,
} from '../lib/series/specs';
import { AnnotationLineStyle } from '../lib/themes/theme';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId, AxisId, GroupId } from '../lib/utils/ids';
import { Scale } from '../lib/utils/scales/scales';
import { Point } from './chart_state';
import { getAxesSpecForSpecId, isHorizontalRotation } from './utils';

export interface AnnotationTooltipState {
  isVisible: boolean;
  header?: string;
  details?: string;
  transform: string;
}
export interface AnnotationDetails {
  headerText?: string;
  detailsText?: string;
}

export interface AnnotationMarker {
  icon: JSX.Element;
  transform: string;
  color: string;
}

export type AnnotationLinePosition = [number, number, number, number];
export interface AnnotationLineProps {
  position: AnnotationLinePosition; // Or AnnotationRectanglePosition or AnnotationTextPosition
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

export type AnnotationDimensions = AnnotationLineProps[];

export const DEFAULT_LINE_OVERFLOW = 0;

export function computeYDomainLineAnnotationDimensions(
  dataValues: AnnotationDatum[],
  yScale: Scale,
  chartRotation: Rotation,
  lineOverflow: number,
  axisPosition: Position,
  chartDimensions: Dimensions,
  lineColor: string,
  marker?: JSX.Element,
) {
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const markerDimensions = { width: 16, height: 18 }; // todo : get from spec

  return dataValues.map((datum: AnnotationDatum): AnnotationLineProps => {
    const { dataValue } = datum;
    const details = {
      detailsText: datum.details,
      headerText: datum.header || dataValue.toString(),
    };

    const yDomainPosition = yScale.scale(dataValue);

    const leftHorizontalAxis: AnnotationLinePosition =
      [0 - lineOverflow, yDomainPosition, chartWidth, yDomainPosition];
    const rightHorizontaAxis: AnnotationLinePosition =
      [0, yDomainPosition, chartWidth + lineOverflow, yDomainPosition];

    // Without overflow applied
    const baseLinePosition: AnnotationLinePosition = isHorizontalChartRotation ?
      [0, yDomainPosition, chartWidth, yDomainPosition]
      : [yDomainPosition, 0, yDomainPosition, chartHeight];

    const linePosition: AnnotationLinePosition = isHorizontalChartRotation ?
      (axisPosition === Position.Left) ? leftHorizontalAxis : rightHorizontaAxis
      : [yDomainPosition, 0, yDomainPosition, chartHeight + lineOverflow];

    const markerPosition = [...linePosition] as AnnotationLinePosition;

    if (isHorizontalChartRotation) {
      if (axisPosition === Position.Left) {
        markerPosition[0] -= markerDimensions.width;
      } else {
        markerPosition[2] += markerDimensions.width;
      }
    } else {
      markerPosition[3] += markerDimensions.height;
    }

    const markerTransform = getAnnotationLineTooltipTransform(chartRotation, markerPosition, axisPosition);
    const annotationMarker = marker ? { icon: marker, transform: markerTransform, color: lineColor } : undefined;
    return { position: linePosition, details, marker: annotationMarker, tooltipLinePosition: baseLinePosition };
  });
}

export function computeXDomainLineAnnotationDimensions(
  dataValues: AnnotationDatum[],
  xScale: Scale,
  chartRotation: Rotation,
  lineOverflow: number,
  axisPosition: Position,
  chartDimensions: Dimensions,
  lineColor: string,
  marker?: JSX.Element,
) {
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;
  const markerDimensions = { width: 16, height: 18 }; // todo : get from spec

  return dataValues.map((datum: AnnotationDatum): AnnotationLineProps => {
    const { dataValue } = datum;
    const details = {
      detailsText: datum.details,
      headerText: datum.header || dataValue.toString(),
    };

    // TODO: make offset dependent on annotationSpec.alignment (left, center, right)
    const offset = xScale.bandwidth / 2;
    const xDomainPosition = xScale.scale(dataValue) + offset;

    let linePosition: AnnotationLinePosition = [0, 0, 0, 0];
    let tooltipLinePosition: AnnotationLinePosition = [0, 0, 0, 0];
    let markerPosition: AnnotationLinePosition = [0, 0, 0, 0];

    switch (chartRotation) {
      case 0: {
        const startY = (axisPosition === Position.Bottom) ? 0 : -lineOverflow;
        const endY = (axisPosition === Position.Bottom) ? chartHeight + lineOverflow : chartHeight;
        linePosition = [xDomainPosition, startY, xDomainPosition, endY];
        tooltipLinePosition = [xDomainPosition, 0, xDomainPosition, chartHeight];

        const startMarkerY = (axisPosition === Position.Bottom) ? 0 : -lineOverflow - markerDimensions.height;
        const endMarkerY = (axisPosition === Position.Bottom) ?
          chartHeight + lineOverflow + markerDimensions.height : chartHeight;
        markerPosition = [xDomainPosition, startMarkerY, xDomainPosition, endMarkerY];
        break;
      }
      case 90: {
        linePosition = [-lineOverflow, xDomainPosition, chartWidth, xDomainPosition];
        tooltipLinePosition = [0, xDomainPosition, chartWidth, xDomainPosition];

        const markerStartX = linePosition[0] - markerDimensions.width;
        markerPosition = [markerStartX, xDomainPosition, chartWidth, xDomainPosition];
        break;
      }
      case -90: {
        linePosition = [-lineOverflow, chartHeight - xDomainPosition, chartWidth, chartHeight - xDomainPosition];
        tooltipLinePosition = [0, chartHeight - xDomainPosition, chartWidth, chartHeight - xDomainPosition];

        const markerStartX = linePosition[0] - markerDimensions.width;
        markerPosition = [markerStartX, chartHeight - xDomainPosition, chartWidth, chartHeight - xDomainPosition];
        break;
      }
      case 180: {
        const startY = (axisPosition === Position.Bottom) ? 0 : -lineOverflow;
        const endY = (axisPosition === Position.Bottom) ? chartHeight + lineOverflow : chartHeight;
        linePosition = [chartWidth - xDomainPosition, startY, chartWidth - xDomainPosition, endY];
        tooltipLinePosition = [chartWidth - xDomainPosition, 0, chartWidth - xDomainPosition, chartHeight];

        const startMarkerY = (axisPosition === Position.Bottom) ? 0 : -lineOverflow - markerDimensions.height;
        const endMarkerY = (axisPosition === Position.Bottom) ?
          chartHeight + lineOverflow + markerDimensions.height : chartHeight;
        markerPosition = [chartWidth - xDomainPosition, startMarkerY, chartWidth - xDomainPosition, endMarkerY];
        break;
      }
    }

    const markerTransform = getAnnotationLineTooltipTransform(chartRotation, markerPosition, axisPosition);
    const annotationMarker = marker ? { icon: marker, transform: markerTransform, color: lineColor } : undefined;
    return { position: linePosition, details, marker: annotationMarker, tooltipLinePosition };
  });
}

export function computeLineAnnotationDimensions(
  annotationSpec: AnnotationSpec,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  axisPosition: Position,
): AnnotationLineProps[] | null {
  const { domainType, dataValues, marker } = annotationSpec;

  // TODO : make line overflow configurable via prop
  const lineOverflow = DEFAULT_LINE_OVERFLOW;

  const lineColor = annotationSpec.style.line.stroke;

  switch (domainType) {
    case AnnotationDomainType.XDomain: {
      return computeXDomainLineAnnotationDimensions(
        dataValues,
        xScale,
        chartRotation,
        lineOverflow,
        axisPosition,
        chartDimensions,
        lineColor,
        marker,
      );
    }
    case AnnotationDomainType.YDomain: {
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
      );
    }
  }
}

export function getAnnotationAxis(
  axesSpecs: Map<AxisId, AxisSpec>,
  groupId: GroupId,
  domainType: AnnotationDomainType,
): Position | null {
  const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, groupId);

  const isXDomainAnnotation = isXDomain(domainType);
  const annotationAxis = isXDomainAnnotation ? xAxis : yAxis;

  return annotationAxis ? annotationAxis.position : null;
}

export function computeAnnotationDimensions(
  annotations: Map<AnnotationId, AnnotationSpec>,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  axesSpecs: Map<AxisId, AxisSpec>,
): Map<AnnotationId, AnnotationDimensions> {
  const annotationDimensions = new Map<AnnotationId, AnnotationDimensions>();

  annotations.forEach((annotationSpec: AnnotationSpec, annotationId: AnnotationId) => {
    switch (annotationSpec.annotationType) {
      case AnnotationType.Line:
        const { groupId, domainType } = annotationSpec;
        const annotationAxisPosition = getAnnotationAxis(axesSpecs, groupId, domainType);

        if (!annotationAxisPosition) {
          return;
        }

        const dimensions = computeLineAnnotationDimensions(
          annotationSpec,
          chartDimensions,
          chartRotation,
          yScales,
          xScale,
          annotationAxisPosition,
        );

        if (dimensions) {
          annotationDimensions.set(annotationId, dimensions);
        }
        break;
    }
  });

  return annotationDimensions;
}

export function isWithinLineBounds(
  linePosition: AnnotationLinePosition,
  cursorPosition: Point,
  offset: number,
  chartRotation: Rotation,
  domainType: AnnotationDomainType,
): boolean {
  const [startX, startY, endX, endY] = linePosition;
  const isXDomainAnnotation = isXDomain(domainType);

  let isCursorWithinXBounds = false;
  let isCursorWithinYBounds = false;
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);

  if (isXDomainAnnotation) {
    isCursorWithinXBounds = isHorizontalChartRotation ?
      cursorPosition.x >= startX - offset && cursorPosition.x <= endX + offset
      : cursorPosition.x >= startX && cursorPosition.x <= endX;
    isCursorWithinYBounds = isHorizontalChartRotation ?
      cursorPosition.y >= startY && cursorPosition.y <= endY
      : cursorPosition.y >= startY - offset && cursorPosition.y <= endY + offset;
    return isCursorWithinXBounds && isCursorWithinYBounds;
  }

  isCursorWithinXBounds = isHorizontalChartRotation ?
    cursorPosition.x >= startX && cursorPosition.x <= endX
    : cursorPosition.x >= startX - offset && cursorPosition.x <= endX + offset;
  isCursorWithinYBounds = isHorizontalChartRotation ?
    cursorPosition.y >= startY - offset && cursorPosition.y <= endY + offset
    : cursorPosition.y >= startY && cursorPosition.y <= endY;
  return isCursorWithinXBounds && isCursorWithinYBounds;
}

export function isVerticalAnnotationLine(
  isXDomainAnnotation: boolean,
  isHorizontalChartRotation: boolean,
): boolean {
  if (isXDomainAnnotation) {
    return isHorizontalChartRotation;
  }

  return !isHorizontalChartRotation;
}

export function getAnnotationLineTooltipXOffset(
  chartRotation: Rotation,
  axisPosition: Position,
): number {
  let xOffset = 0;

  const isHorizontalAxis = isHorizontal(axisPosition);
  const isChartHorizontalRotation = isHorizontalRotation(chartRotation);

  if (isHorizontalAxis) {
    xOffset = isChartHorizontalRotation ? 50 : 0;
  } else {
    xOffset = isChartHorizontalRotation ? (axisPosition === Position.Right ? 100 : 0) : 50;
  }

  return xOffset;
}

export function getAnnotationLineTooltipYOffset(
  chartRotation: Rotation,
  axisPosition: Position,
): number {
  let yOffset = 0;

  const isHorizontalAxis = isHorizontal(axisPosition);
  const isChartHorizontalRotation = isHorizontalRotation(chartRotation);

  if (isHorizontalAxis) {
    yOffset = isChartHorizontalRotation ? (axisPosition === Position.Top ? 0 : 100) : 50;
  } else {
    yOffset = isChartHorizontalRotation ? 50 : 100;
  }

  return yOffset;
}

export function getAnnotationLineTooltipPosition(
  chartRotation: Rotation,
  linePosition: AnnotationLinePosition,
  axisPosition: Position,
): TransformPosition {
  const [startX, startY, endX, endY] = linePosition;

  const xPosition = (axisPosition === Position.Right) ? endX : startX;
  const yPosition = (axisPosition === Position.Top) ? startY : endY;

  const xOffset = getAnnotationLineTooltipXOffset(chartRotation, axisPosition);
  const yOffset = getAnnotationLineTooltipYOffset(chartRotation, axisPosition);

  return { xPosition, yPosition, xOffset, yOffset };
}

export function toTransformString(position: TransformPosition): string {
  const { xPosition, yPosition, xOffset, yOffset } = position;

  const xTranslation = `calc(${xPosition}px - ${xOffset}%)`;
  const yTranslation = `calc(${yPosition}px - ${yOffset}%)`;

  return `translate(${xTranslation},${yTranslation})`;
}

export function getAnnotationLineTooltipTransform(
  chartRotation: Rotation,
  linePosition: AnnotationLinePosition,
  axisPosition: Position,
): string {
  const position = getAnnotationLineTooltipPosition(
    chartRotation,
    linePosition,
    axisPosition,
  );

  return toTransformString(position);
}

export function isXDomain(domainType: AnnotationDomainType): boolean {
  return domainType === AnnotationDomainType.XDomain;
}

export function computeLineAnnotationTooltipState(
  cursorPosition: Point,
  annotationLines: AnnotationLineProps[],
  groupId: GroupId,
  domainType: AnnotationDomainType,
  style: AnnotationLineStyle,
  chartRotation: Rotation,
  axesSpecs: Map<AxisId, AxisSpec>,
): AnnotationTooltipState {

  const annotationTooltipState: AnnotationTooltipState = {
    isVisible: false,
    transform: '',
  };

  const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, groupId);
  const isXDomainAnnotation = isXDomain(domainType);
  const annotationAxis = isXDomainAnnotation ? xAxis : yAxis;

  if (!annotationAxis) {
    return annotationTooltipState;
  }

  const axisPosition = annotationAxis.position;

  annotationLines.forEach((line: AnnotationLineProps) => {
    const lineOffset = style.line.strokeWidth / 2;
    const isWithinBounds = isWithinLineBounds(
      line.position,
      cursorPosition,
      lineOffset,
      chartRotation,
      domainType,
    );

    if (isWithinBounds) {
      annotationTooltipState.isVisible = true;

      // Position tooltip based on axis position & lineOffset amount
      annotationTooltipState.transform = getAnnotationLineTooltipTransform(
        chartRotation,
        line.tooltipLinePosition,
        axisPosition,
      );

      if (line.details) {
        annotationTooltipState.header = line.details.headerText;
        annotationTooltipState.details = line.details.detailsText;
      }
    }
  });

  return annotationTooltipState;
}

export function computeAnnotationTooltipState(
  cursorPosition: Point,
  annotationDimensions: Map<AnnotationId, any>,
  annotationSpecs: Map<AnnotationId, AnnotationSpec>,
  chartRotation: Rotation,
  axesSpecs: Map<AxisId, AxisSpec>,
): AnnotationTooltipState {
  for (const [annotationId, annotationDimension] of annotationDimensions) {
    const spec = annotationSpecs.get(annotationId);
    if (!spec) {
      continue;
    }

    const { annotationType } = spec;
    switch (annotationType) {
      case AnnotationType.Line: {
        const groupId = spec.groupId;
        const lineAnnotationTooltipState = computeLineAnnotationTooltipState(
          cursorPosition,
          annotationDimension,
          groupId,
          spec.domainType,
          spec.style,
          chartRotation,
          axesSpecs,
        );

        if (lineAnnotationTooltipState.isVisible) {
          return lineAnnotationTooltipState;
        }
      }
    }
  }

  return {
    isVisible: false,
    transform: '',
  };
}
