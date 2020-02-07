import { Stroke, Line } from '../../../../../geoms/types';
import { stringToRGB } from '../../../../partition_chart/layout/utils/d3_utils';
import { AnnotationLineProps } from '../../../annotations/line_annotation_tooltip';
import { LineAnnotationStyle } from '../../../../../utils/themes/theme';
import { renderMultiLine } from '../primitives/line';

export function renderLineAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: AnnotationLineProps[],
  lineStyle: LineAnnotationStyle,
) {
  const lines = annotations.map<Line>((annotation) => {
    const { start, end } = annotation.linePathPoints;
    return {
      x1: start.x1,
      y1: start.y1,
      x2: end.x2,
      y2: end.y2,
    };
  });
  const strokeColor = stringToRGB(lineStyle.line.stroke);
  strokeColor.opacity = strokeColor.opacity * lineStyle.line.opacity;
  const stroke: Stroke = {
    color: strokeColor,
    width: lineStyle.line.strokeWidth,
  };

  renderMultiLine(ctx, lines, stroke);
}
