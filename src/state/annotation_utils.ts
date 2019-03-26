import { IndexedGeometry } from '../lib/series/rendering';
import {
  AnnotationDomainType,
  AnnotationPositionType,
  AnnotationSpec,
  AnnotationType,
} from '../lib/series/specs';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId } from '../lib/utils/ids';

export type AnnotationLinePosition = [number, number, number, number];

export function computeLineAnnotationDimensions(
  annotationSpec: AnnotationSpec,
  geometriesIndex: Map<any, IndexedGeometry[]>,
  chartDimensions: Dimensions,
) {
  const { position } = annotationSpec;
  const chartHeight = chartDimensions.height;
  // const chartWidth = chartDimensions.width;
  switch (position.positionType) {
    case AnnotationPositionType.SeriesDatum:
      const { domainType, dataValues } = position;
      if (domainType === AnnotationDomainType.XDomain) {
        // TODO: clean this up with a reduce or something
        // my kingdom for an Array.prototype.filterMap
        const renderedPositions: number[][] = [];
        dataValues.forEach((value: any) => {
          const indexedValues = geometriesIndex.get(value);
          if (indexedValues != null && indexedValues.length >= 0) {
            const xOffset = indexedValues[0].geom.width / 2;
            const xPosition = indexedValues[0].geom.x + xOffset;

            // Adjust for rotation?
            const linePositions = [xPosition, 0, xPosition, chartHeight];

            renderedPositions.push(linePositions);
          }
        });

        return renderedPositions;
      }

      break;
    case AnnotationPositionType.ChartCoordinate:
      break;
  }
}

export function computeAnnotationDimensions(
  annotations: Map<AnnotationId, AnnotationSpec>,
  geometriesIndex: Map<any, IndexedGeometry[]>,
  chartDimensions: Dimensions,
): Map<AnnotationId, any> {
  const annotationDimensions = new Map<AnnotationId, any>();

  annotations.forEach((annotationSpec: AnnotationSpec, annotationId: AnnotationId) => {
    switch (annotationSpec.annotationType) {
      case AnnotationType.Line:
        const dimensions = computeLineAnnotationDimensions(annotationSpec, geometriesIndex, chartDimensions);
        annotationDimensions.set(annotationId, dimensions);
        break;
    }
  });

  return annotationDimensions;
}
