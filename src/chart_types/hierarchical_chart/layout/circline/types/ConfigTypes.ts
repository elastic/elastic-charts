import { Distance, Pixels, Radian, Radius, Ratio, SizeRatio, TimeMs } from './GeometryTypes';
import { Color, FontWeight } from './Types';

export interface ViewQuery {
  // terminology: https://en.wikipedia.org/wiki/Star_schema
  name: string;
  factsQuerySQL: string;
}

// todo switch to `io-ts` style, generic way of combining static and runtime type info
export interface StaticConfig {
  // view query
  viewQuery: ViewQuery;

  // shape geometry
  width: number;
  height: number;
  margin: { left: SizeRatio; right: SizeRatio; top: SizeRatio; bottom: SizeRatio };
  emptySizeRatio: SizeRatio;
  outerSizeRatio: SizeRatio;
  rotation: Radian;
  fromAngle: Radian;
  toAngle: Radian;
  clockwiseSectors: boolean;
  specialFirstInnermostSector: boolean;
  straightening: Ratio;
  shear: Distance;
  collapse: Ratio;
  treemap: Ratio;

  // overall data ink layout
  colors: string;
  palettes: { [k: string]: Array<any> };

  // general text config
  fontFamily: string;

  // fill text config
  minFontSize: Pixels;
  maxFontSize: Pixels;
  idealFontSizeJump: number;

  // fill text layout config
  circlePadding: Distance;
  radialPadding: Distance;
  horizontalTextAngleThreshold: Radian;
  horizontalTextEnforcer: Ratio;
  maxRowCount: number;
  fillOutside: boolean;
  radiusOutside: Radius;
  fillRectangleWidth: number;
  fillRectangleHeight: number;
  fillLabel: {
    textColor: Color;
    textInvertible: boolean;
    textWeight: FontWeight;
    fontStyle: string;
    fontVariant: string;
    formatter: Function;
  };

  // linked labels (primarily: single-line)
  linkLabel: {
    maximumSection: number; // use linked labels below this limit
    fontSize: Pixels;
    gap: Pixels;
    spacing: Pixels;
    minimumStemLength: Distance;
    stemAngle: Radian;
    horizontalStemLength: Distance;
    radiusPadding: Distance;
    lineWidth: Pixels;
    maxCount: number;
    textColor: Color;
    textInvertible: boolean;
    textOpacity: number;
  };

  // other
  backgroundColor: Color;
  sectorLineWidth: Pixels;
}

export type EasingFunction = (x: Ratio) => Ratio;

export interface AnimKeyframe {
  time: number;
  easingFunction: EasingFunction;
  keyframeConfig: Partial<StaticConfig>;
}

export interface Config extends StaticConfig {
  animation: {
    duration: TimeMs;
    keyframes: Array<AnimKeyframe>;
  };
}

// switching to `io-ts` style, generic way of combining static and runtime type info - 1st step
class Type<A> {
  dflt: A;
  reconfigurable: boolean | string;
  documentation = 'string';

  constructor(dflt: A, reconfigurable: boolean | string, documentation: string) {
    this.dflt = dflt;
    this.reconfigurable = reconfigurable;
    this.documentation = documentation;
  }
}

export class Numeric extends Type<number> {
  min: number;
  max: number;
  type = 'number';

  constructor({
    dflt,
    min,
    max,
    reconfigurable,
    documentation,
  }: {
    dflt: number;
    min: number;
    max: number;
    reconfigurable: boolean | string;
    documentation: string;
  }) {
    super(dflt, reconfigurable, documentation);
    this.min = min;
    this.max = max;
  }
}
