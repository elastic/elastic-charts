import { Box, TextMeasure } from '../types/types';

export function measureText(ctx: CanvasRenderingContext2D): TextMeasure {
  return (fontSize: number, boxes: Box[]): TextMetrics[] =>
    boxes.map(({ fontStyle, fontVariant, fontWeight, fontFamily, text }: Box) => {
      ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`;
      return ctx.measureText(text);
    });
}
