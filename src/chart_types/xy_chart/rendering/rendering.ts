import { area, line } from 'd3-shape';
import { CanvasTextBBoxCalculator } from '../../../utils/bbox/canvas_text_bbox_calculator';
import {
  AreaSeriesStyle,
  LineSeriesStyle,
  PointStyle,
  SharedGeometryStateStyle,
  BarSeriesStyle,
  GeometryStateStyle,
} from '../../../utils/themes/theme';
import { Scale, ScaleType, isLogarithmicScale } from '../../../scales';
import { CurveType, getCurveFactory } from '../../../utils/curves';
import { DataSeriesDatum, SeriesIdentifier, DataSeries } from '../utils/series';
import { DisplayValueSpec, PointStyleAccessor, BarStyleAccessor } from '../utils/specs';
import {
  IndexedGeometry,
  PointGeometry,
  BarGeometry,
  AreaGeometry,
  LineGeometry,
  isPointGeometry,
  ClippedRanges,
  BandedAccessorType,
} from '../../../utils/geometry';
import { mergePartial } from '../../../utils/commons';
import { LegendItem } from '../legend/legend';

export function mutableIndexedGeometryMapUpsert(
  mutableGeometriesIndex: Map<any, IndexedGeometry[]>,
  key: any,
  geometry: IndexedGeometry | IndexedGeometry[],
) {
  const existing = mutableGeometriesIndex.get(key);
  const upsertGeometry: IndexedGeometry[] = Array.isArray(geometry) ? geometry : [geometry];
  if (existing === undefined) {
    mutableGeometriesIndex.set(key, upsertGeometry);
  } else {
    mutableGeometriesIndex.set(key, [...upsertGeometry, ...existing]);
  }
}

export function getPointStyleOverrides(
  datum: DataSeriesDatum,
  seriesIdentifier: SeriesIdentifier,
  pointStyleAccessor?: PointStyleAccessor,
): Partial<PointStyle> | undefined {
  const styleOverride = pointStyleAccessor && pointStyleAccessor(datum, seriesIdentifier);

  if (!styleOverride) {
    return;
  }

  if (typeof styleOverride === 'string') {
    return {
      stroke: styleOverride,
    };
  }

  return styleOverride;
}

export function getBarStyleOverrides(
  datum: DataSeriesDatum,
  seriesIdentifier: SeriesIdentifier,
  seriesStyle: BarSeriesStyle,
  styleAccessor?: BarStyleAccessor,
): BarSeriesStyle {
  const styleOverride = styleAccessor && styleAccessor(datum, seriesIdentifier);

  if (!styleOverride) {
    return seriesStyle;
  }

  if (typeof styleOverride === 'string') {
    return {
      ...seriesStyle,
      rect: {
        ...seriesStyle.rect,
        fill: styleOverride,
      },
    };
  }

  return mergePartial(seriesStyle, styleOverride, {
    mergeOptionalPartialValues: true,
  });
}

function renderPoints(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: string,
  hasY0Accessors: boolean,
  styleAccessor?: PointStyleAccessor,
): {
  pointGeometries: PointGeometry[];
  indexedGeometries: Map<any, IndexedGeometry[]>;
} {
  const indexedGeometries: Map<any, IndexedGeometry[]> = new Map();
  const isLogScale = isLogarithmicScale(yScale);
  const pointGeometries = dataSeries.data.reduce((acc, datum) => {
    const { x: xValue, y0, y1, initialY0, initialY1, filled } = datum;
    // don't create the point if not within the xScale domain or it that point was filled
    if (!xScale.isValueInDomain(xValue) || (filled && filled.y1 !== undefined)) {
      return acc;
    }
    const x = xScale.scale(xValue);
    const points: PointGeometry[] = [];
    const yDatums = hasY0Accessors ? [y0, y1] : [y1];

    yDatums.forEach((yDatum, index) => {
      // skip rendering point if y1 is null
      if (y1 === null) {
        return;
      }
      let y;
      let radius = 10;
      // we fix 0 and negative values at y = 0
      if (yDatum === null || (isLogScale && yDatum <= 0)) {
        y = yScale.range[0];
        radius = 0;
      } else {
        y = yScale.scale(yDatum);
      }
      const originalY = hasY0Accessors && index === 0 ? initialY0 : initialY1;
      const seriesIdentifier: SeriesIdentifier = {
        key: dataSeries.key,
        specId: dataSeries.specId,
        yAccessor: dataSeries.yAccessor,
        splitAccessors: dataSeries.splitAccessors,
        seriesKeys: dataSeries.seriesKeys,
      };
      const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, styleAccessor);
      const pointGeometry: PointGeometry = {
        radius,
        x,
        y,
        color,
        value: {
          x: xValue,
          y: originalY,
          accessor: hasY0Accessors && index === 0 ? BandedAccessorType.Y0 : BandedAccessorType.Y1,
        },
        transform: {
          x: shift,
          y: 0,
        },
        seriesIdentifier,
        styleOverrides,
      };
      mutableIndexedGeometryMapUpsert(indexedGeometries, xValue, pointGeometry);
      // use the geometry only if the yDatum in contained in the current yScale domain
      const isHidden = yDatum === null || (isLogScale && yDatum <= 0);
      if (!isHidden && yScale.isValueInDomain(yDatum)) {
        points.push(pointGeometry);
      }
    });
    return [...acc, ...points];
  }, [] as PointGeometry[]);
  return {
    pointGeometries,
    indexedGeometries,
  };
}

export function renderBars(
  orderIndex: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: string,
  sharedSeriesStyle: BarSeriesStyle,
  displayValueSettings?: DisplayValueSpec,
  styleAccessor?: BarStyleAccessor,
  minBarHeight?: number,
): {
  barGeometries: BarGeometry[];
  indexedGeometries: Map<any, IndexedGeometry[]>;
} {
  const indexedGeometries: Map<any, IndexedGeometry[]> = new Map();
  const barGeometries: BarGeometry[] = [];

  const bboxCalculator = new CanvasTextBBoxCalculator();

  // default padding to 1 for now
  const padding = 1;
  const fontSize = sharedSeriesStyle.displayValue.fontSize;
  const fontFamily = sharedSeriesStyle.displayValue.fontFamily;
  const absMinHeight = minBarHeight && Math.abs(minBarHeight);

  dataSeries.data.forEach((datum) => {
    const { y0, y1, initialY1, filled } = datum;
    // don't create a bar if the initialY1 value is null.
    if (y1 === null || initialY1 === null || (filled && filled.y1 !== undefined)) {
      return;
    }
    // don't create a bar if not within the xScale domain
    if (!xScale.isValueInDomain(datum.x)) {
      return;
    }

    let y = 0;
    let y0Scaled;
    if (yScale.type === ScaleType.Log) {
      y = y1 === 0 || y1 === null ? yScale.range[0] : yScale.scale(y1);
      if (yScale.isInverted) {
        y0Scaled = y0 === 0 || y0 === null ? yScale.range[1] : yScale.scale(y0);
      } else {
        y0Scaled = y0 === 0 || y0 === null ? yScale.range[0] : yScale.scale(y0);
      }
    } else {
      y = yScale.scale(y1);
      if (yScale.isInverted) {
        // use always zero as baseline if y0 is null
        y0Scaled = y0 === null ? yScale.scale(0) : yScale.scale(y0);
      } else {
        y0Scaled = y0 === null ? yScale.scale(0) : yScale.scale(y0);
      }
    }

    let height = y0Scaled - y;

    // handle minBarHeight adjustment
    if (absMinHeight !== undefined && height !== 0 && Math.abs(height) < absMinHeight) {
      const heightDelta = absMinHeight - Math.abs(height);
      if (height < 0) {
        height = -absMinHeight;
        y = y + heightDelta;
      } else {
        height = absMinHeight;
        y = y - heightDelta;
      }
    }

    const x = xScale.scale(datum.x) + xScale.bandwidth * orderIndex;
    const width = xScale.bandwidth;

    const formattedDisplayValue =
      displayValueSettings && displayValueSettings.valueFormatter
        ? displayValueSettings.valueFormatter(initialY1)
        : undefined;

    // only show displayValue for even bars if showOverlappingValue
    const displayValueText =
      displayValueSettings && displayValueSettings.isAlternatingValueLabel
        ? barGeometries.length % 2 === 0
          ? formattedDisplayValue
          : undefined
        : formattedDisplayValue;

    const computedDisplayValueWidth = bboxCalculator.compute(displayValueText || '', padding, fontSize, fontFamily)
      .width;
    const displayValueWidth =
      displayValueSettings && displayValueSettings.isValueContainedInElement ? width : computedDisplayValueWidth;

    const hideClippedValue = displayValueSettings ? displayValueSettings.hideClippedValue : undefined;

    const displayValue =
      displayValueSettings && displayValueSettings.showValueLabel
        ? {
            text: displayValueText,
            width: displayValueWidth,
            height: fontSize,
            hideClippedValue,
            isValueContainedInElement: displayValueSettings.isValueContainedInElement,
          }
        : undefined;

    const seriesIdentifier: SeriesIdentifier = {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
    };

    const seriesStyle = getBarStyleOverrides(datum, seriesIdentifier, sharedSeriesStyle, styleAccessor);

    const barGeometry: BarGeometry = {
      displayValue,
      x,
      y, // top most value
      width,
      height,
      color,
      value: {
        x: datum.x,
        y: initialY1,
        accessor: BandedAccessorType.Y1,
      },
      seriesIdentifier,
      seriesStyle,
    };
    mutableIndexedGeometryMapUpsert(indexedGeometries, datum.x, barGeometry);
    barGeometries.push(barGeometry);
  });

  bboxCalculator.destroy();

  return {
    barGeometries,
    indexedGeometries,
  };
}

export function renderLine(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: string,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: LineSeriesStyle,
  pointStyleAccessor?: PointStyleAccessor,
  hasFit?: boolean,
): {
  lineGeometry: LineGeometry;
  indexedGeometries: Map<any, IndexedGeometry[]>;
} {
  const isLogScale = isLogarithmicScale(yScale);

  const pathGenerator = line<DataSeriesDatum>()
    .x(({ x }) => xScale.scale(x) - xScaleOffset)
    .y((datum) => {
      const yValue = getYValue(datum);

      if (yValue !== null) {
        return yScale.scale(yValue);
      }

      // this should never happen thanks to the defined function
      return yScale.isInverted ? yScale.range[1] : yScale.range[0];
    })
    .defined((datum) => {
      const yValue = getYValue(datum);
      return yValue !== null && !(isLogScale && yValue <= 0) && xScale.isValueInDomain(datum.x);
    })
    .curve(getCurveFactory(curve));
  const y = 0;
  const x = shift;

  const { pointGeometries, indexedGeometries } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    color,
    hasY0Accessors,
    pointStyleAccessor,
  );

  const clippedRanges = hasFit && !hasY0Accessors ? getClippedRanges(dataSeries.data, xScale, xScaleOffset) : [];
  const lineGeometry = {
    line: pathGenerator(dataSeries.data) || '',
    points: pointGeometries,
    color,
    transform: {
      x,
      y,
    },
    seriesIdentifier: {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
    },
    seriesLineStyle: seriesStyle.line,
    seriesPointStyle: seriesStyle.point,
    clippedRanges,
  };
  return {
    lineGeometry,
    indexedGeometries,
  };
}

/**
 * Returns value of `y1` or `filled.y1` or null
 */
export const getYValue = ({ y1, filled }: DataSeriesDatum): number | null => {
  if (y1 !== null) {
    return y1;
  }

  if (filled && filled.y1 !== undefined) {
    return filled.y1;
  }

  return null;
};

export function renderArea(
  shift: number,
  dataSeries: DataSeries,
  xScale: Scale,
  yScale: Scale,
  color: string,
  curve: CurveType,
  hasY0Accessors: boolean,
  xScaleOffset: number,
  seriesStyle: AreaSeriesStyle,
  isStacked = false,
  pointStyleAccessor?: PointStyleAccessor,
  hasFit?: boolean,
): {
  areaGeometry: AreaGeometry;
  indexedGeometries: Map<any, IndexedGeometry[]>;
} {
  const isLogScale = isLogarithmicScale(yScale);
  const pathGenerator = area<DataSeriesDatum>()
    .x(({ x }) => xScale.scale(x) - xScaleOffset)
    .y1((datum) => {
      const yValue = getYValue(datum);
      if (yValue !== null) {
        return yScale.scale(yValue);
      }
      // this should never happen thanks to the defined function
      return yScale.isInverted ? yScale.range[1] : yScale.range[0];
    })
    .y0(({ y0 }) => {
      if (y0 === null || (isLogScale && y0 <= 0)) {
        return yScale.range[0];
      }
      return yScale.scale(y0);
    })
    .defined((datum) => {
      const yValue = getYValue(datum);
      return yValue !== null && !(isLogScale && yValue <= 0) && xScale.isValueInDomain(datum.x);
    })
    .curve(getCurveFactory(curve));

  const clippedRanges =
    hasFit && !hasY0Accessors && !isStacked ? getClippedRanges(dataSeries.data, xScale, xScaleOffset) : [];
  const y1Line = pathGenerator.lineY1()(dataSeries.data);
  const lines: string[] = [];
  if (y1Line) {
    lines.push(y1Line);
  }
  if (hasY0Accessors) {
    const y0Line = pathGenerator.lineY0()(dataSeries.data);
    if (y0Line) {
      lines.push(y0Line);
    }
  }

  const { pointGeometries, indexedGeometries } = renderPoints(
    shift - xScaleOffset,
    dataSeries,
    xScale,
    yScale,
    color,
    hasY0Accessors,
    pointStyleAccessor,
  );

  const areaGeometry: AreaGeometry = {
    area: pathGenerator(dataSeries.data) || '',
    lines,
    points: pointGeometries,
    color,
    transform: {
      y: 0,
      x: shift,
    },
    seriesIdentifier: {
      key: dataSeries.key,
      specId: dataSeries.specId,
      yAccessor: dataSeries.yAccessor,
      splitAccessors: dataSeries.splitAccessors,
      seriesKeys: dataSeries.seriesKeys,
    },
    seriesAreaStyle: seriesStyle.area,
    seriesAreaLineStyle: seriesStyle.line,
    seriesPointStyle: seriesStyle.point,
    isStacked,
    clippedRanges,
  };
  return {
    areaGeometry,
    indexedGeometries,
  };
}

/**
 * Gets clipped ranges that have been fitted to values
 * @param dataset
 * @param xScale
 * @param xScaleOffset
 */
export function getClippedRanges(dataset: DataSeriesDatum[], xScale: Scale, xScaleOffset: number): ClippedRanges {
  let firstNonNullX: number | null = null;
  let hasNull = false;

  return dataset.reduce<ClippedRanges>((acc, { x, y1 }) => {
    const xValue = xScale.scale(x) - xScaleOffset + xScale.bandwidth / 2;

    if (y1 !== null) {
      if (hasNull) {
        if (firstNonNullX !== null) {
          acc.push([firstNonNullX, xValue]);
        } else {
          acc.push([0, xValue]);
        }
        hasNull = false;
      }

      firstNonNullX = xValue;
    } else {
      const endXValue = xScale.range[1] - xScale.bandwidth * (2 / 3);
      if (firstNonNullX !== null && xValue === endXValue) {
        acc.push([firstNonNullX, xValue]);
      }
      hasNull = true;
    }
    return acc;
  }, []);
}

export function getGeometryStateStyle(
  seriesIdentifier: SeriesIdentifier,
  highlightedLegendItem: LegendItem | null,
  sharedGeometryStyle: SharedGeometryStateStyle,
  individualHighlight?: { [key: string]: boolean },
): GeometryStateStyle {
  const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;

  if (highlightedLegendItem != null) {
    const isPartOfHighlightedSeries = seriesIdentifier.key === highlightedLegendItem.seriesIdentifier.key;

    return isPartOfHighlightedSeries ? highlighted : unhighlighted;
  }

  if (individualHighlight) {
    const { hasHighlight, hasGeometryHover } = individualHighlight;
    if (!hasGeometryHover) {
      return highlighted;
    }
    return hasHighlight ? highlighted : unhighlighted;
  }

  return defaultStyles;
}

export function isPointOnGeometry(
  xCoordinate: number,
  yCoordinate: number,
  indexedGeometry: BarGeometry | PointGeometry,
) {
  const { x, y } = indexedGeometry;
  if (isPointGeometry(indexedGeometry)) {
    const { radius, transform } = indexedGeometry;
    return (
      yCoordinate >= y - radius &&
      yCoordinate <= y + radius &&
      xCoordinate >= x + transform.x - radius &&
      xCoordinate <= x + transform.x + radius
    );
  }
  const { width, height } = indexedGeometry;
  return yCoordinate >= y && yCoordinate <= y + height && xCoordinate >= x && xCoordinate <= x + width;
}

export function getSeriesIdentifierPrefixedKey(seriesIdentifier: SeriesIdentifier, prefix?: string, postfix?: string) {
  return `${prefix || ''}${seriesIdentifier.key}${postfix || ''}`;
}
