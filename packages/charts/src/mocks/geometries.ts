/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { MockSeriesIdentifier } from './series/series_identifiers';
import { buildPointGeometryStyles } from '../chart_types/xy_chart/rendering/point_style';
import { Colors } from '../common/colors';
import { SeriesType } from '../specs';
import type { RecursivePartial } from '../utils/common';
import { mergePartial } from '../utils/common';
import type { AreaGeometry, BarGeometry, BubbleGeometry, LineGeometry, PointGeometry } from '../utils/geometry';
import { LIGHT_THEME } from '../utils/themes/light_theme';
import { PointShape } from '../utils/themes/theme';

const { barSeriesStyle, lineSeriesStyle, areaSeriesStyle, bubbleSeriesStyle } = LIGHT_THEME;

/** @internal */
export class MockPointGeometry {
  private static readonly base: PointGeometry = {
    x: 0,
    y: 0,
    radius: lineSeriesStyle.point.radius,
    color: Colors.Red.keyword,
    seriesIdentifier: MockSeriesIdentifier.default(),
    style: {
      shape: PointShape.Circle,
      fill: { color: Colors.White.rgba },
      stroke: { color: Colors.Red.rgba, width: 1 },
    },
    value: { accessor: 'y0', x: 0, y: 0, mark: null, datum: { x: 0, y: 0 } },
    transform: { x: 0, y: 0 },
    panel: { width: 100, height: 100, left: 0, top: 0 },
    isolated: false,
    seriesType: SeriesType.Line,
  };

  static default(partial?: RecursivePartial<PointGeometry>) {
    const color = partial?.color ?? Colors.Red.keyword;
    const style = buildPointGeometryStyles(color, lineSeriesStyle.point);
    return mergePartial<PointGeometry>(MockPointGeometry.base, partial, {}, [{ style }]);
  }
}

/** @internal */
export class MockBarGeometry {
  private static readonly base: BarGeometry = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    color: Colors.Red.keyword,
    displayValue: undefined,
    seriesIdentifier: MockSeriesIdentifier.default(),
    value: { accessor: 'y0', x: 0, y: 0, mark: null, datum: { x: 0, y: 0 } },
    seriesStyle: barSeriesStyle,
    transform: { x: 0, y: 0 },
    panel: { width: 100, height: 100, left: 0, top: 0 },
  };

  static default(partial?: RecursivePartial<BarGeometry>) {
    return mergePartial<BarGeometry>(MockBarGeometry.base, partial);
  }
}

/** @internal */
export class MockLineGeometry {
  private static readonly base: LineGeometry = {
    line: '',
    points: [],
    color: Colors.Red.keyword,
    transform: { x: 0, y: 0 },
    seriesIdentifier: MockSeriesIdentifier.default(),
    style: lineSeriesStyle,
    clippedRanges: [],
    shouldClip: false,
    hasFit: false,
    minPointDistance: 40,
  };

  static default(partial?: RecursivePartial<LineGeometry>) {
    return mergePartial<LineGeometry>(MockLineGeometry.base, partial);
  }
}

/** @internal */
export class MockAreaGeometry {
  private static readonly base: AreaGeometry = {
    area: '',
    lines: [],
    points: [],
    color: Colors.Red.keyword,
    transform: { x: 0, y: 0 },
    seriesIdentifier: MockSeriesIdentifier.default(),
    style: areaSeriesStyle,
    isStacked: false,
    clippedRanges: [],
    shouldClip: false,
    hasFit: false,
    minPointDistance: 40,
  };

  static default(partial?: RecursivePartial<AreaGeometry>) {
    return mergePartial<AreaGeometry>(MockAreaGeometry.base, partial);
  }
}

/** @internal */
export class MockBubbleGeometry {
  private static readonly base: BubbleGeometry = {
    points: [],
    color: Colors.Red.keyword,
    seriesIdentifier: MockSeriesIdentifier.default(),
    seriesPointStyle: bubbleSeriesStyle.point,
  };

  static default(partial?: RecursivePartial<BubbleGeometry>) {
    return mergePartial<BubbleGeometry>(MockBubbleGeometry.base, partial);
  }
}
