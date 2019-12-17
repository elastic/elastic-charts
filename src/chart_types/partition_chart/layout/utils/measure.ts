import { TextMeasure } from '../types/Types';

export const measureText = (ctx: CanvasRenderingContext2D): TextMeasure => (
  font: string,
  texts: string[],
): TextMetrics[] => {
  ctx.font = font;
  return texts.map((text) => ctx.measureText(text));
};
