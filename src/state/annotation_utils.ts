import {
  AnnotationDatum,
  AnnotationDomainType,
  AnnotationSpec,
  AnnotationType,
  AxisSpec,
  Position,
  Rotation,
} from '../lib/series/specs';
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../lib/themes/theme';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId, AxisId, getGroupId, GroupId } from '../lib/utils/ids';
import { Scale } from '../lib/utils/scales/scales';
import { Point } from './chart_state';
import { getAxesSpecForSpecId, isHorizontalRotation } from './utils';

export interface AnnotationTooltipState {
  isVisible: boolean;
  header: undefined | string;
  details: undefined | string;
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
      const groupId = annotationSpec.groupId || getGroupId('__global__');
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
): Map<AnnotationId, any> { // TODO: tighten up this type
  const annotationDimensions = new Map<AnnotationId, any>();

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

export function getAnnotationLineStrokeWidth(spec: AnnotationSpec): number {
  if (spec.lineStyle && spec.lineStyle.line && (spec.lineStyle.line.strokeWidth !== null)) {
    return spec.lineStyle.line.strokeWidth;
  }
  return DEFAULT_ANNOTATION_LINE_STYLE.line.strokeWidth;
}

export function getAnnotationLineOffset(spec: AnnotationSpec): number {
  return getAnnotationLineStrokeWidth(spec) / 2;
}

export function isVerticalAnnotationLine(isXDomainAnnotation: boolean, isHorizontalChartRotation: boolean): boolean {
  if (isXDomainAnnotation) {
    return isHorizontalChartRotation;
  }

  return !isHorizontalChartRotation;
}

export function getAnnotationLineTooltipPosition(
  chartRotation: Rotation,
  linePosition: AnnotationLinePosition,
  axisPosition: Position,
) {
  const [startX, startY, endX, endY] = linePosition;

  let xPosition = startX;
  let yPosition = endY;
  let xOffset = 0;
  let yOffset = 0;

  // const isHorizontalAxis = isHorizontal(axisPosition);
  const isChartHorizontalRotation = isHorizontalRotation(chartRotation);

  switch (axisPosition) {
    case Position.Bottom: {
      xPosition = startX;
      yPosition = endY;
      xOffset = isChartHorizontalRotation ? 50 : 0;
      yOffset = isChartHorizontalRotation ? 100 : 50;
      break;
    }
    case Position.Top: {
      xPosition = startX;
      yPosition = startY;
      xOffset = isChartHorizontalRotation ? 50 : 0;
      yOffset = isChartHorizontalRotation ? 0 : 50;
      break;
    }
    case Position.Left: {
      xPosition = startX;
      yPosition = endY;
      xOffset = isChartHorizontalRotation ? 0 : 50;
      yOffset = isChartHorizontalRotation ? 50 : 100;
      break;
    }
    case Position.Right: {
      xPosition = endX;
      yPosition = endY;
      xOffset = isChartHorizontalRotation ? 100 : 50;
      yOffset = isChartHorizontalRotation ? 50 : 100;
      break;
    }
  }

  return { xPosition, yPosition, xOffset, yOffset };
}

export function getAnnotationLineTooltipTransform(
  chartRotation: Rotation,
  linePosition: AnnotationLinePosition,
  axisPosition: Position,
) {
  const { xPosition, yPosition, xOffset, yOffset } = getAnnotationLineTooltipPosition(
    chartRotation,
    linePosition,
    axisPosition,
  );

  const xTranslation = `calc(${xPosition}px - ${xOffset}%)`;
  const yTranslation = `calc(${yPosition}px - ${yOffset}%)`;

  return `translate(${xTranslation},${yTranslation})`;
}

export function isXDomain(domainType: AnnotationDomainType): boolean {
  return domainType === AnnotationDomainType.XDomain;
}

export function computeLineAnnotationTooltipState(
  cursorPosition: Point,
  annotationLines: AnnotationLineProps[],
  spec: AnnotationSpec,
  chartRotation: Rotation,
  axesSpecs: Map<AxisId, AxisSpec>,
): AnnotationTooltipState {

  const annotationTooltipState: AnnotationTooltipState = {
    isVisible: false,
    header: undefined,
    details: undefined,
    transform: '',
  };

  const groupId = spec.groupId || getGroupId('__global__');
  const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, groupId);
  const isXDomainAnnotation = isXDomain(spec.domainType);
  const annotationAxis = isXDomainAnnotation ? xAxis : yAxis;

  if (!annotationAxis) {
    return annotationTooltipState;
  }

  const axisPosition = annotationAxis.position;

  annotationLines.forEach((line: AnnotationLineProps) => {
    const cursorOffset = getAnnotationLineOffset(spec);
    const isWithinBounds = isWithinLineBounds(
      line.position,
      cursorPosition,
      cursorOffset,
      chartRotation,
      spec.domainType,
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
        const lineAnnotationTooltipState = computeLineAnnotationTooltipState(
          cursorPosition,
          annotationDimension,
          spec,
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
    header: undefined,
    details: undefined,
    transform: '',
  };
}
