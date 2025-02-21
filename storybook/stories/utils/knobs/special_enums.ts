/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { select } from '@storybook/addon-knobs';
import type { $Values } from 'utility-types';

import type { TooltipProps, Rotation } from '@elastic/charts';
import { Placement, SeriesType, BarSeries, LineSeries, AreaSeries, BubbleSeries } from '@elastic/charts';

import { getMultiSelectKnob, getNumberSelectKnob } from './custom';

/**
 * Negative numbers do not behave well with vrt slugified naming
 */
const getRotationKnob = (name = 'chartRotation') =>
  getNumberSelectKnob<Rotation>(
    name,
    {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    },
    0,
  );

const boundaryMap: Record<string, TooltipProps['boundary'] | null> = {
  default: undefined,
  chart: 'chart',
};

const getBoundaryKnob = () => {
  const boundaryString =
    select<string>(
      'Boundary Element',
      {
        Default: 'default',
        Chart: 'chart',
      },
      'default',
    ) ?? '';

  return boundaryMap[boundaryString] ?? undefined;
};

const getFallbackPlacementsKnob = (groupId?: string): Placement[] => {
  return getMultiSelectKnob<Placement>(
    'Fallback Placements',
    {
      Top: Placement.Top,
      Bottom: Placement.Bottom,
      Left: Placement.Left,
      Right: Placement.Right,
      TopStart: Placement.TopStart,
      TopEnd: Placement.TopEnd,
      BottomStart: Placement.BottomStart,
      BottomEnd: Placement.BottomEnd,
      RightStart: Placement.RightStart,
      RightEnd: Placement.RightEnd,
      LeftStart: Placement.LeftStart,
      LeftEnd: Placement.LeftEnd,
      Auto: Placement.Auto,
      AutoStart: Placement.AutoStart,
      AutoEnd: Placement.AutoEnd,
    },
    [Placement.Right, Placement.Left, Placement.Top, Placement.Bottom],
    undefined,
    groupId,
  );
};

const XYSeriesTypeMap = {
  [SeriesType.Bar]: BarSeries,
  [SeriesType.Line]: LineSeries,
  [SeriesType.Area]: AreaSeries,
  [SeriesType.Bubble]: BubbleSeries,
};

export const getXYSeriesTypeKnob = (
  name = 'SeriesType',
  value: SeriesType = SeriesType.Bar,
  options?: { group?: string; exclude: SeriesType[] },
) => {
  return select<SeriesType>(
    name,
    Object.fromEntries(Object.entries(SeriesType).filter(([, type]) => !(options?.exclude ?? []).includes(type))),
    value,
    options?.group,
  );
};

export const getXYSeriesKnob = (
  name = 'SeriesType',
  value: SeriesType = SeriesType.Bar,
  options?: { group?: string; exclude: SeriesType[] },
): [$Values<typeof XYSeriesTypeMap>, SeriesType] => {
  const spectType = getXYSeriesTypeKnob(name, value, options);

  return [XYSeriesTypeMap[spectType], spectType];
};

export const specialEnumKnobs = {
  rotation: getRotationKnob,
  fallbackPlacements: getFallbackPlacementsKnob,
  boundary: getBoundaryKnob,
  xySeriesType: getXYSeriesTypeKnob,
  xySeries: getXYSeriesKnob,
};
