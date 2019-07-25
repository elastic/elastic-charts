import { GroupId } from '../../../utils/ids';
import { ScaleBand } from '../../../utils/scales/scale_band';
import { ScaleContinuous } from '../../../utils/scales/scale_continuous';
import { Scale, ScaleType } from '../../../utils/scales/scales';
import { XDomain } from '../domains/x_domain';
import { YDomain } from '../domains/y_domain';
import { FormattedDataSeries } from './series';

/**
 * Count the max number of bars in cluster value.
 * Doesn't take in consideration areas, lines or points.
 * @param stacked all the stacked formatted dataseries
 * @param nonStacked all the non-stacked formatted dataseries
 */
export function countBarsInCluster(
  stacked: FormattedDataSeries[],
  nonStacked: FormattedDataSeries[],
): {
  nonStackedBarsInCluster: number;
  stackedBarsInCluster: number;
  totalBarsInCluster: number;
} {
  // along x axis, we count one "space" per bar series.
  // we ignore the points, areas, lines as they are
  // aligned with the x value and doesn't occupy space
  const nonStackedBarsInCluster = nonStacked.reduce((acc, ns) => {
    return acc + ns.counts.barSeries;
  }, 0);
  // count stacked bars groups as 1 per group
  const stackedBarsInCluster = stacked.reduce((acc, ns) => {
    return acc + (ns.counts.barSeries > 0 ? 1 : 0);
  }, 0);
  const totalBarsInCluster = nonStackedBarsInCluster + stackedBarsInCluster;
  return {
    nonStackedBarsInCluster,
    stackedBarsInCluster,
    totalBarsInCluster,
  };
}

function getBandScaleRange(
  isInverse: boolean,
  isSingleValueHistogram: boolean,
  minRange: number,
  maxRange: number,
  bandwidth: number,
): {
  start: number;
  end: number;
} {
  const rangeEndOffset = isSingleValueHistogram ? 0 : bandwidth;
  const start = isInverse ? minRange - rangeEndOffset : minRange;
  const end = isInverse ? maxRange : maxRange - rangeEndOffset;

  return { start, end };
}

/**
 * Compute the x scale used to align geometries to the x axis.
 * @param xDomain the x domain
 * @param totalBarsInCluster the total number of grouped series
 * @param axisLength the length of the x axis
 */
export function computeXScale(
  xDomain: XDomain,
  totalBarsInCluster: number,
  minRange: number,
  maxRange: number,
  barsPadding?: number,
  enableHistogramMode?: boolean,
): Scale {
  const { scaleType, minInterval, domain, isBandScale, timeZone } = xDomain;
  const rangeDiff = Math.abs(maxRange - minRange);
  const isInverse = maxRange < minRange;
  if (scaleType === ScaleType.Ordinal) {
    const dividend = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
    const bandwidth = rangeDiff / (domain.length * dividend);
    return new ScaleBand(domain, [minRange, maxRange], bandwidth, barsPadding);
  } else {
    if (isBandScale) {
      const [domainMin, domainMax] = domain;
      const isSingleValueHistogram = !!enableHistogramMode && domainMax - domainMin === 0;

      const adjustedDomainMax = isSingleValueHistogram ? domainMin + minInterval : domainMax;
      const adjustedDomain = [domainMin, adjustedDomainMax];

      const intervalCount = (adjustedDomain[1] - adjustedDomain[0]) / minInterval;
      const intervalCountOffest = isSingleValueHistogram ? 0 : 1;
      const bandwidth = rangeDiff / (intervalCount + intervalCountOffest);

      const { start, end } = getBandScaleRange(isInverse, isSingleValueHistogram, minRange, maxRange, bandwidth);

      const scale = new ScaleContinuous(
        scaleType,
        adjustedDomain,
        [start, end],
        bandwidth / totalBarsInCluster,
        minInterval,
        timeZone,
        totalBarsInCluster,
        barsPadding,
      );

      return scale;
    } else {
      return new ScaleContinuous(
        scaleType,
        domain,
        [minRange, maxRange],
        0,
        minInterval,
        timeZone,
        totalBarsInCluster,
        barsPadding,
      );
    }
  }
}

/**
 * Compute the y scales, one per groupId for the y axis.
 * @param yDomains the y domains
 * @param axisLength the axisLength of the y axis
 */
export function computeYScales(yDomains: YDomain[], minRange: number, maxRange: number): Map<GroupId, Scale> {
  const yScales: Map<GroupId, Scale> = new Map();

  yDomains.forEach((yDomain) => {
    const yScale = new ScaleContinuous(yDomain.scaleType, yDomain.domain, [minRange, maxRange]);
    yScales.set(yDomain.groupId, yScale);
  });

  return yScales;
}
