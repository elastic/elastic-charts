import {
  AnnotationDatum,
  AnnotationDomainType,
  AnnotationSpec,
  AnnotationType,
  Rotation,
} from '../lib/series/specs';
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../lib/themes/theme';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId, getGroupId, GroupId } from '../lib/utils/ids';
import { Scale } from '../lib/utils/scales/scales';
import { Point } from './chart_state';
import { isHorizontalRotation } from './utils';

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

  // TODO: positions for hover state details component
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
        const linePosition: AnnotationLinePosition = isHorizontalChartRotation ?
          [xDomainPosition, 0, xDomainPosition, chartHeight] :
          [0, xDomainPosition, chartWidth, xDomainPosition];

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

export function getAnnotationLineOffset(spec: AnnotationSpec): number {
  if (spec.lineStyle && spec.lineStyle.line && (spec.lineStyle.line.strokeWidth !== null)) {
    return spec.lineStyle.line.strokeWidth / 2;
  }
  return DEFAULT_ANNOTATION_LINE_STYLE.line.strokeWidth / 2;
}

export function computeAnnotationTooltipState(
  cursorPosition: Point,
  annotationDimensions: Map<AnnotationId, any>,
  annotationSpecs: Map<AnnotationId, AnnotationSpec>,
): AnnotationTooltipState {

  const annotationTooltipState: {
    isVisible: boolean;
    header: undefined | string;
    details: undefined | string;
    transform: string;
  } = {
    isVisible: false,
    header: undefined,
    details: undefined,
    transform: '',
  };

  annotationDimensions.forEach((annotationDimension: any, annotationId: AnnotationId) => {
    const spec = annotationSpecs.get(annotationId);
    if (!spec) {
      return;
    }

    const { annotationType } = spec;
    switch (annotationType) {
      case AnnotationType.Line: {
        annotationDimension.forEach((line: AnnotationLineProps) => {
          const { position } = line;

          const [startX, startY, endX, endY] = position;
          const cursorOffset = getAnnotationLineOffset(spec);

          const isCursorWithinXBounds = cursorPosition.x >= startX - cursorOffset &&
            cursorPosition.x <= endX + cursorOffset;
          const isCursorWithinYBounds = cursorPosition.y >= startY && cursorPosition.y <= endY;
          if (isCursorWithinXBounds && isCursorWithinYBounds) {
            annotationTooltipState.isVisible = true;

            if (line.details) {
              annotationTooltipState.header = line.details.headerText;
              annotationTooltipState.details = line.details.detailsText;
            }
          }
        });
        break;
      }
    }
  });

  return annotationTooltipState;
}
