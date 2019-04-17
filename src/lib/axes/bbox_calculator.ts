import { Option } from 'fp-ts/lib/Option';

export interface BBox {
  width: number;
  height: number;
}

export interface BBoxCalculator {
  compute(text: string, fontSize?: number, fontFamily?: string, padding?: number ): Option<BBox>;
  destroy(): void;
}
