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
 * under the License. */

import { ScaleType, ScaleContinuousType } from '.';
import { Domain } from '../utils/domain';
import { Range, maxValueWithUpperLimit } from '../utils/commons';
import { SCALES } from './scale_continuous';
import { scaleBand, scaleUtc, scaleQuantize } from 'd3-scale';
import { PrimitiveValue } from '../chart_types/partition_chart/layout/utils/group_by_rollup';
import { getMomentWithTz } from '../utils/data/date_time';

export interface BaseScale<T> {
  scale: (value: T) => number | null;
  invert: (value: number) => T | null;
  ticks: () => T[];
}

export function getContinuousScale(
  type: ScaleContinuousType,
  range: Range,
  domain: Domain,
  maxTicks: number = 10,
  timeZone?: string,
): BaseScale<number> {
  const d3Scale = SCALES[type]();
  d3Scale.domain(domain);
  d3Scale.range(range);
  let tickValues: Array<number>;
  if (type === ScaleType.Time) {
    const startDomain = getMomentWithTz(domain[0], timeZone);
    const endDomain = getMomentWithTz(domain[1], timeZone);
    const offset = startDomain.utcOffset();
    const shiftedDomainMin = startDomain.add(offset, 'minutes').valueOf();
    const shiftedDomainMax = endDomain.add(offset, 'minutes').valueOf();
    const tzShiftedScale = scaleUtc().domain([shiftedDomainMin, shiftedDomainMax]);

    const rawTicks = tzShiftedScale.ticks(maxTicks);
    const timePerTick = (shiftedDomainMax - shiftedDomainMin) / rawTicks.length;
    const hasHourTicks = timePerTick < 1000 * 60 * 60 * 12;

    tickValues = rawTicks.map((d: Date) => {
      const currentDateTime = getMomentWithTz(d, timeZone);
      const currentOffset = hasHourTicks ? offset : currentDateTime.utcOffset();
      return currentDateTime.subtract(currentOffset, 'minutes').valueOf();
    });
  } else {
    tickValues = d3Scale.ticks(maxTicks) as number[];
  }

  return {
    scale: (value: number) => {
      return d3Scale(value);
    },
    invert: (value: number) => {
      return +d3Scale.invert(value);
    },
    ticks: () => {
      return tickValues;
    },
  };
}

export function getOrdinalScale(
  range: Range,
  domain: Domain,
  padding: number = 0,
): BaseScale<NonNullable<PrimitiveValue>> {
  const d3Scale = scaleBand<NonNullable<PrimitiveValue>>();
  d3Scale.domain(domain);
  d3Scale.range(range);
  const safeBarPadding = maxValueWithUpperLimit(padding, 0, 1);
  d3Scale.paddingInner(safeBarPadding);
  d3Scale.paddingOuter(safeBarPadding / 2);
  const invertedScale = scaleQuantize()
    .domain(range)
    .range(domain);
  return {
    scale: (value: PrimitiveValue) => {
      if (value === null) {
        return null;
      }
      const scaledValue = d3Scale(value);
      if (scaledValue != null) {
        return scaledValue + d3Scale.bandwidth() / 2;
      }
      return null;
    },
    invert: (value: number) => {
      return invertedScale(value);
    },
    ticks: () => {
      return domain;
    },
  };
}
