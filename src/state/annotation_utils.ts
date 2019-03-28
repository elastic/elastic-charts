import {
  AnnotationDatum,
  AnnotationDomainType,
  AnnotationSpec,
  AnnotationType,
  Rotation,
} from '../lib/series/specs';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId, getGroupId, GroupId } from '../lib/utils/ids';
import { Scale } from '../lib/utils/scales/scales';
import { isHorizontalRotation } from './utils';

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
