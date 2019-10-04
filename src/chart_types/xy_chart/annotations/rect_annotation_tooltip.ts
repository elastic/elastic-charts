import { AnnotationTypes, RectAnnotationDatum, RectAnnotationSpec, Rotation } from '../utils/specs';
import { Dimensions } from '../../../utils/dimensions';
import { GroupId } from '../../../utils/ids';
import { Scale } from '../../../utils/scales/scales';
import { isHorizontalRotation } from '../state/utils';
import { Point } from '../../../utils/point';
import {
  AnnotationTooltipFormatter,
  AnnotationTooltipState,
  getRotatedCursor,
  scaleAndValidateDatum,
} from './annotation_utils';

export interface AnnotationRectProps {
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  details?: string;
}

export function getRectAnnotationTooltipStateFromCursor(
  rawCursorPosition: Point,
  annotationRects: AnnotationRectProps[],
  chartRotation: Rotation,
  chartDimensions: Dimensions,
  renderTooltip?: AnnotationTooltipFormatter,
): AnnotationTooltipState {
  const cursorPosition = getRotatedCursor(rawCursorPosition, chartDimensions, chartRotation);

  const annotationTooltipState: AnnotationTooltipState = {
    isVisible: false,
    transform: '',
    annotationType: AnnotationTypes.Rectangle,
  };

  const isRightTooltip = isRightRectTooltip(chartRotation, cursorPosition, chartDimensions.width);
  const isBottomTooltip = isBottomRectTooltip(chartRotation, cursorPosition, chartDimensions.height);

  annotationRects.forEach((rectProps: AnnotationRectProps) => {
    const { rect, details } = rectProps;
    const startX = rect.x;
    const endX = startX + rect.width;

    const startY = rect.y;
    const endY = startY + rect.height;

    const isWithinBounds = isWithinRectBounds(cursorPosition, { startX, endX, startY, endY });
    if (isWithinBounds) {
      annotationTooltipState.isVisible = true;
      annotationTooltipState.details = details;

      const tooltipLeft = computeRectTooltipLeft(
        chartRotation,
        isRightTooltip,
        { startX, endX },
        rawCursorPosition.x,
        chartDimensions.width,
      );
      const tooltipTop = computeRectTooltipTop(
        chartRotation,
        isBottomTooltip,
        { startX, endX },
        rawCursorPosition.y,
        chartDimensions.height,
      );

      const { offsetLeft, offsetTop } = computeRectTooltipOffset(isRightTooltip, isBottomTooltip, chartRotation);

      annotationTooltipState.top = tooltipTop;
      annotationTooltipState.left = tooltipLeft;
      annotationTooltipState.transform = `translate(${offsetLeft}, ${offsetTop})`;
      annotationTooltipState.renderTooltip = renderTooltip;
    }
  });

  return annotationTooltipState;
}

export function isRightRectTooltip(chartRotation: Rotation, cursorPosition: Point, chartWidth: number) {
  const xPosition = isHorizontalRotation(chartRotation) ? cursorPosition.x : cursorPosition.y;

  return chartRotation === -90 ? xPosition > chartWidth / 2 : xPosition < chartWidth / 2;
}

export function isBottomRectTooltip(chartRotation: Rotation, cursorPosition: Point, chartHeight: number) {
  const yPosition = isHorizontalRotation(chartRotation) ? cursorPosition.y : cursorPosition.x;
  return chartRotation === 180 ? yPosition > chartHeight / 2 : yPosition < chartHeight / 2;
}

export function computeRectTooltipLeft(
  chartRotation: Rotation,
  isRightTooltip: boolean,
  { startX, endX }: { startX: number; endX: number },
  cursorX: number,
  chartWidth: number,
): number {
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const horizontalLeft = isRightTooltip ? endX : startX;
  return isHorizontalChartRotation ? (chartRotation === 180 ? chartWidth - horizontalLeft : horizontalLeft) : cursorX;
}

export function computeRectTooltipTop(
  chartRotation: Rotation,
  isBottomTooltip: boolean,
  { startX, endX }: { startX: number; endX: number },
  cursorY: number,
  chartHeight: number,
): number {
  const isHorizontalChartRotation = isHorizontalRotation(chartRotation);
  const verticalTop = isBottomTooltip ? endX : startX;

  return isHorizontalChartRotation ? cursorY : chartRotation === -90 ? chartHeight - verticalTop : verticalTop;
}

export function computeRectTooltipOffset(
  isRightTooltip: boolean,
  isBottomTooltip: boolean,
  chartRotation: Rotation,
): { offsetLeft: string; offsetTop: string } {
  const offsetLeft = isRightTooltip ? (chartRotation === 180 ? '-100%' : '0') : chartRotation === 180 ? '0' : '-100%';
  const offsetTop = isBottomTooltip ? (chartRotation === -90 ? '-100%' : '0') : chartRotation === -90 ? '0' : '-100%';

  return { offsetLeft, offsetTop };
}

export function computeRectAnnotationDimensions(
  annotationSpec: RectAnnotationSpec,
  yScales: Map<GroupId, Scale>,
  xScale: Scale,
  enableHistogramMode: boolean,
  barsPadding: number,
): AnnotationRectProps[] | null {
  const { dataValues } = annotationSpec;

  const groupId = annotationSpec.groupId;
  const yScale = yScales.get(groupId);
  if (!yScale) {
    return null;
  }

  const xDomain = xScale.domain;
  const yDomain = yScale.domain;
  const lastX = xDomain[xDomain.length - 1];
  const xMinInterval = xScale.minInterval;
  const rectsProps: AnnotationRectProps[] = [];

  dataValues.forEach((dataValue: RectAnnotationDatum) => {
    let { x0, x1, y0, y1 } = dataValue.coordinates;

    // if everything is null, return; otherwise we coerce the other coordinates
    if (x0 == null && x1 == null && y0 == null && y1 == null) {
      return;
    }

    if (x1 == null) {
      // if x1 is defined, we want the rect to draw to the end of the scale
      // if we're in histogram mode, extend domain end by min interval
      x1 = enableHistogramMode && !xScale.isSingleValue() ? lastX + xMinInterval : lastX;
    }

    if (x0 == null) {
      // if x0 is defined, we want the rect to draw to the start of the scale
      x0 = xDomain[0];
    }

    if (y0 == null) {
      // if y0 is defined, we want the rect to draw to the end of the scale
      y0 = yDomain[yDomain.length - 1];
    }

    if (y1 == null) {
      // if y1 is defined, we want the rect to draw to the start of the scale
      y1 = yDomain[0];
    }

    const alignWithTick = xScale.bandwidth > 0 && !enableHistogramMode;

    let x0Scaled = scaleAndValidateDatum(x0, xScale, alignWithTick);
    let x1Scaled = scaleAndValidateDatum(x1, xScale, alignWithTick);
    const y0Scaled = scaleAndValidateDatum(y0, yScale, false);
    const y1Scaled = scaleAndValidateDatum(y1, yScale, false);

    // TODO: surface this as a warning
    if ([x0Scaled, x1Scaled, y0Scaled, y1Scaled].includes(null)) {
      return;
    }

    let xOffset = 0;
    if (xScale.bandwidth > 0) {
      const xBand = xScale.bandwidth / (1 - xScale.barsPadding);
      xOffset = enableHistogramMode ? (xBand - xScale.bandwidth) / 2 : barsPadding;
    }

    x0Scaled = x0Scaled - xOffset;
    x1Scaled = x1Scaled - xOffset;

    const minX = Math.min(x0Scaled, x1Scaled);
    const minY = Math.min(y0Scaled, y1Scaled);

    const deltaX = Math.abs(x0Scaled - x1Scaled);
    const deltaY = Math.abs(y0Scaled - y1Scaled);

    const xOrigin = minX;
    const yOrigin = minY;

    const width = deltaX;
    const height = deltaY;

    const rectDimensions = {
      x: xOrigin,
      y: yOrigin,
      width,
      height,
    };

    rectsProps.push({
      rect: rectDimensions,
      details: dataValue.details,
    });
  });

  return rectsProps;
}

export function isWithinRectBounds(
  cursorPosition: Point,
  { startX, endX, startY, endY }: { startX: number; endX: number; startY: number; endY: number },
): boolean {
  const withinXBounds = cursorPosition.x > startX && cursorPosition.x < endX;
  const withinYBounds = cursorPosition.y > startY && cursorPosition.y < endY;

  return withinXBounds && withinYBounds;
}
