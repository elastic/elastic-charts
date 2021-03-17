/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Scale, ScaleBand, ScaleContinuous } from '../../../scales';
import { ScaleType } from '../../../scales/constants';
import { LogBase } from '../../../scales/scale_continuous';
import { ContinuousDomain, Range } from '../../../utils/domain';
import { GroupId } from '../../../utils/ids';
import { XDomain, YDomain } from '../domains/types';

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

interface XScaleOptions {
  xDomain: XDomain;
  totalBarsInCluster: number;
  range: Range;
  barsPadding?: number;
  enableHistogramMode?: boolean;
  ticks?: number;
  integersOnly?: boolean;
  logBase?: LogBase;
  logMinLimit?: number;
}

/**
 * Compute the x scale used to align geometries to the x axis.
 * @param xDomain the x domain
 * @param totalBarsInCluster the total number of grouped series
 * @param axisLength the length of the x axis
 * @internal
 */
export function computeXScale(options: XScaleOptions): Scale {
  const { xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, ticks, integersOnly } = options;
  const { scaleType, minInterval, domain, isBandScale, timeZone, logBase } = xDomain;
  const rangeDiff = Math.abs(range[1] - range[0]);
  const isInverse = range[1] < range[0];
  if (scaleType === ScaleType.Ordinal) {
    const dividend = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
    const bandwidth = rangeDiff / (domain.length * dividend);
    return new ScaleBand(domain, range, bandwidth, barsPadding);
  }
  if (isBandScale) {
    const [domainMin, domainMax] = domain as ContinuousDomain;
    const isSingleValueHistogram = !!enableHistogramMode && domainMax - domainMin === 0;

    const adjustedDomainMax = isSingleValueHistogram ? domainMin + minInterval : domainMax;
    const adjustedDomain = [domainMin, adjustedDomainMax];

    const intervalCount = (adjustedDomain[1] - adjustedDomain[0]) / minInterval;
    const intervalCountOffest = isSingleValueHistogram ? 0 : 1;
    const bandwidth = rangeDiff / (intervalCount + intervalCountOffest);
    const { start, end } = getBandScaleRange(isInverse, isSingleValueHistogram, range[0], range[1], bandwidth);

    const scale = new ScaleContinuous(
      {
        type: scaleType,
        domain: adjustedDomain,
        range: [start, end],
      },
      {
        bandwidth: totalBarsInCluster > 0 ? bandwidth / totalBarsInCluster : bandwidth,
        minInterval,
        timeZone,
        totalBarsInCluster,
        barsPadding,
        ticks,
        isSingleValueHistogram,
        logBase,
      },
    );

    return scale;
  }
  return new ScaleContinuous(
    { type: scaleType, domain, range },
    {
      bandwidth: 0,
      minInterval,
      timeZone,
      totalBarsInCluster,
      barsPadding,
      ticks,
      integersOnly,
      logBase,
    },
  );
}

interface YScaleOptions {
  yDomains: YDomain[];
  range: Range;
  ticks?: number;
  integersOnly?: boolean;
}

/**
 * Compute the y scales, one per groupId for the y axis.
 * @param yDomains the y domains
 * @param axisLength the axisLength of the y axis
 * @internal
 */
export function computeYScales(options: YScaleOptions): Map<GroupId, Scale> {
  const yScales: Map<GroupId, Scale> = new Map();
  const { yDomains, range, ticks, integersOnly } = options;
  yDomains.forEach(({ scaleType: type, domain, groupId, logBase, logMinLimit }) => {
    const yScale = new ScaleContinuous(
      {
        type,
        domain,
        range,
      },
      {
        ticks,
        integersOnly,
        logBase,
        logMinLimit,
      },
    );
    yScales.set(groupId, yScale);
  });

  return yScales;
}
