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
import { AnnotationLineStyle, DEFAULT_ANNOTATION_LINE_STYLE } from '../lib/themes/theme';
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

export type AnnotationLinePosition = [number, number, number, number];
export interface AnnotationLineProps {
  position: AnnotationLinePosition; // Or AnnotationRectanglePosition or AnnotationTextPosition
  details: AnnotationDetails;
}

interface TransformPosition {
  xPosition: number;
  yPosition: number;
  xOffset: number;
  yOffset: number;
}

export type AnnotationDimensions = AnnotationLineProps[];

export function computeLineAnnotationDimensions(
  annotationSpec: AnnotationSpec,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
): AnnotationLineProps[] | null {
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const chartHeight = chartDimensions.height;
  const chartWidth = chartDimensions.width;

  const { domainType, dataValues } = annotationSpec;

  // TODO : need to make this dependent on axis position as well
  const lineOverflow = 0;

  switch (domainType) {
    case AnnotationDomainType.XDomain: {
      return dataValues.map((datum: AnnotationDatum): AnnotationLineProps => {
        const { dataValue } = datum;
        const details = {
          detailsText: datum.details,
        };

        // TODO: make offset dependent on annotationSpec.alignment (left, center, right)
        const offset = xScale.bandwidth / 2;
        const xDomainPosition = xScale.scale(dataValue) + offset;

        let linePosition: AnnotationLinePosition = [0, 0, 0, 0];
        switch (chartRotation) {
          case 0: {
            linePosition = [xDomainPosition, 0, xDomainPosition, chartHeight + lineOverflow];
            break;
          }
          case 90: {
            linePosition = [0 - lineOverflow, xDomainPosition, chartWidth, xDomainPosition];
            break;
          }
          case -90: {
            linePosition = [0 - lineOverflow, chartHeight - xDomainPosition, chartWidth, chartHeight - xDomainPosition];
            break;
          }
          case 180: {
            linePosition = [chartWidth - xDomainPosition, 0, chartWidth - xDomainPosition, chartHeight + lineOverflow];
            break;
          }
        }

        return { position: linePosition, details };
      });
    }
    case AnnotationDomainType.YDomain: {
      const groupId = annotationSpec.groupId;
      const yScale = yScales.get(groupId);
      if (!yScale) {
        return null;
      }

      return dataValues.map((datum: AnnotationDatum): AnnotationLineProps => {
        const { dataValue } = datum;
        const details = {
          detailsText: datum.details,
        };

        const yDomainPosition = yScale.scale(dataValue);
        const linePosition: AnnotationLinePosition = isHorizontalChartRotation ?
          [0, yDomainPosition, chartWidth, yDomainPosition]
          : [yDomainPosition, 0, yDomainPosition, chartHeight];

        return { position: linePosition, details };
      });
    }
  }
}

export function computeAnnotationDimensions(
  annotations: Map<AnnotationId, AnnotationSpec>,
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
): Map<AnnotationId, AnnotationDimensions> { // TODO: tighten up this type
  const annotationDimensions = new Map<AnnotationId, AnnotationDimensions>();

  annotations.forEach((annotationSpec: AnnotationSpec, annotationId: AnnotationId) => {
    switch (annotationSpec.annotationType) {
      case AnnotationType.Line:
        const dimensions = computeLineAnnotationDimensions(
          annotationSpec,
          chartDimensions,
          chartRotation,
          yScales,
          xScale,
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

export function getAnnotationLineStrokeWidth(lineStyle?: Partial<AnnotationLineStyle>): number {
  if (lineStyle && lineStyle.line && (lineStyle.line.strokeWidth !== null)) {
    return lineStyle.line.strokeWidth;
  }
  return DEFAULT_ANNOTATION_LINE_STYLE.line.strokeWidth;
}

export function getAnnotationLineOffset(lineStyle?: Partial<AnnotationLineStyle>): number {
  return getAnnotationLineStrokeWidth(lineStyle) / 2;
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
  lineStyle: Partial<AnnotationLineStyle> | undefined,
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
    const lineOffset = getAnnotationLineOffset(lineStyle);
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
        line.position,
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
          spec.lineStyle,
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
