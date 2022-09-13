/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PopoverAnchorPosition } from '@elastic/eui';
import { select, array, number, optionsKnob, boolean } from '@storybook/addon-knobs';
import {
  OptionsTypeKnobSingleValue,
  OptionsTypeKnobValue,
  OptionsTypeOptionsProp,
  SelectTypeKnobValue,
} from '@storybook/addon-knobs/dist/components/types';
import { OptionsKnobOptionsDisplay } from '@storybook/addon-knobs/dist/components/types/Options';
import { startCase, kebabCase } from 'lodash';
import { $Values } from 'utility-types';

import {
  Rotation,
  Position,
  Placement,
  TooltipProps,
  SeriesType,
  BarSeries,
  LineSeries,
  AreaSeries,
  BubbleSeries,
  TooltipStickTo,
} from '@elastic/charts';
import { TooltipType } from '@elastic/charts/src/specs/constants';
import { VerticalAlignment, HorizontalAlignment } from '@elastic/charts/src/utils/common';

export const getPositiveNumberKnob = (name: string, value: number, groupId?: string) =>
  number(name, value, { min: 0 }, groupId);

export function getToggledNumber<T>(initEnabled: boolean, fallbackValue: T) {
  return (...[name, initialValue, options, groupId]: Parameters<typeof number>) => {
    const enabled = boolean(`${name} - enabled`, initEnabled, groupId);
    const value = number(name, initialValue, options, groupId);
    return enabled ? value : fallbackValue;
  };
}

export const numberSelect = <T extends number>(
  name: string,
  options: { [s: string]: T },
  value: T,
  groupId?: string,
): T => (parseInt(select<T | string>(name, options, value, groupId) as string, 10) as T) || value;

export const getChartRotationKnob = () =>
  numberSelect<Rotation>(
    'chartRotation',
    {
      '0 deg': 0,
      '90 deg': 90,
      '-90 deg': -90,
      '180 deg': 180,
    },
    0,
  );

export const getTooltipTypeKnob = (
  name = 'tooltip type',
  defaultValue: TooltipType = TooltipType.VerticalCursor,
  groupId?: string,
) =>
  select<TooltipType>(
    name,
    {
      Vertical: TooltipType.VerticalCursor,
      Follow: TooltipType.Follow,
      Crosshairs: TooltipType.Crosshairs,
      None: TooltipType.None,
    },
    defaultValue,
    groupId,
  );

interface KnobFromEnumOptions<T extends SelectTypeKnobValue> {
  group?: string;
  allowUndefined?: boolean;
  include?: T[];
  exclude?: T[];
}

/**
 * Generates storybook knobs from const enum
 *
 * TODO: cleanup types to infer T
 */
export const getKnobsFromEnum = <T extends SelectTypeKnobValue, O extends Record<keyof O, T>>(
  name: string,
  options: O,
  defaultValue: T,
  { group, allowUndefined, include, exclude }: KnobFromEnumOptions<T> = {},
): T | undefined =>
  select<T>(
    name,
    (Object.entries<T>(options) as [keyof O, T][])
      .filter(([, v]) => !include || include.includes(v))
      .filter(([, v]) => !exclude || !exclude.includes(v))
      .reduce<O>((acc, [key, value]) => {
        // @ts-ignore - override key casing
        acc[startCase(kebabCase(key))] = value;
        return acc;
      }, (allowUndefined ? { Undefined: undefined } : ({} as unknown)) as O),
    defaultValue,
    group,
  ) || undefined;

export const getPositionKnob = (name = 'chartRotation', defaultValue: Position = Position.Right, group?: string) =>
  select<Position>(
    name,
    {
      Right: Position.Right,
      Left: Position.Left,
      Top: Position.Top,
      Bottom: Position.Bottom,
    },
    defaultValue,
    group,
  );

export const getPlacementKnob = (name = 'placement', defaultValue?: Placement, groupId?: string) => {
  const value = select<Placement | undefined>(
    name,
    {
      Default: undefined,
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
    defaultValue,
    groupId,
  );

  return value || undefined;
};

export const getStickToKnob = (name = 'stickTo', defaultValue = TooltipStickTo.MousePosition, groupId?: string) => {
  const value = select<TooltipStickTo | undefined>(
    name,
    {
      Default: undefined,
      ...TooltipStickTo,
    },
    defaultValue,
    groupId,
  );

  return value || undefined;
};

export const getEuiPopoverPositionKnob = (
  name = 'Popover position',
  defaultValue: PopoverAnchorPosition = 'leftCenter',
  group?: string,
) =>
  select<PopoverAnchorPosition>(
    name,
    {
      upCenter: 'upCenter',
      upLeft: 'upLeft',
      upRight: 'upRight',
      downCenter: 'downCenter',
      downLeft: 'downLeft',
      downRight: 'downRight',
      leftCenter: 'leftCenter',
      leftUp: 'leftUp',
      leftDown: 'leftDown',
      rightCenter: 'rightCenter',
      rightUp: 'rightUp',
      rightDown: 'rightDown',
    },
    defaultValue,
    group,
  );

export function arrayKnobs(name: string, values: (string | number)[]): (string | number)[] {
  const stringifiedValues = values.map<string>((d) => `${d}`);
  return array(name, stringifiedValues).map<string | number>((value: string) =>
    Number.isFinite(parseFloat(value)) ? parseFloat(value) : value,
  );
}

/**
 * This throws from storybook when values array becomes empty :(
 */
export function getMultiSelectKnob<T extends OptionsTypeKnobSingleValue>(
  name: string,
  valuesObj: OptionsTypeOptionsProp<T>,
  value: OptionsTypeKnobValue<T>,
  display: OptionsKnobOptionsDisplay = 'multi-select',
  groupId?: string,
): T[] {
  const knob = optionsKnob<T>(
    name,
    valuesObj,
    value,
    {
      display,
    },
    groupId,
  );

  if (Array.isArray(knob)) return knob as T[];
  if (typeof knob === 'string') return knob.split(', ') as T[];
  if (typeof knob === 'number') return [knob] as T[];
  return !knob ? [] : knob;
}

export const getFallbackPlacementsKnob = (groupId?: string): Placement[] => {
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

const boundaryMap: Record<string, TooltipProps['boundary'] | null> = {
  default: undefined,
  chart: 'chart',
};

export const getBoundaryKnob = () => {
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

export const getVerticalTextAlignmentKnob = (group?: string) =>
  select<VerticalAlignment | undefined>(
    'Vertical Text alignment',
    {
      None: undefined,
      Middle: VerticalAlignment.Middle,
      Top: VerticalAlignment.Top,
      Bottom: VerticalAlignment.Bottom,
      Near: VerticalAlignment.Near,
      Far: VerticalAlignment.Far,
    },
    undefined,
    group,
  ) || undefined;

export const getHorizontalTextAlignmentKnob = (group?: string) =>
  select<HorizontalAlignment | undefined>(
    'Horizontal Text alignment',
    {
      None: undefined,
      Center: HorizontalAlignment.Center,
      Left: HorizontalAlignment.Left,
      Right: HorizontalAlignment.Right,
      Near: HorizontalAlignment.Near,
      Far: HorizontalAlignment.Far,
    },
    undefined,
    group,
  ) || undefined;

export const XYSeriesTypeMap = {
  [SeriesType.Bar]: BarSeries,
  [SeriesType.Line]: LineSeries,
  [SeriesType.Area]: AreaSeries,
  [SeriesType.Bubble]: BubbleSeries,
};

export const getXYSeriesTypeKnob = (
  name = 'SeriesType',
  value: SeriesType = SeriesType.Bar,
  groupId?: string,
  options?: { ignore: SeriesType[] },
) => {
  return select<SeriesType>(
    name,
    Object.fromEntries(Object.entries(SeriesType).filter(([, type]) => !(options?.ignore ?? []).includes(type))),
    value,
    groupId,
  );
};

export const getXYSeriesKnob = (
  name = 'SeriesType',
  value: SeriesType = SeriesType.Bar,
  groupId?: string,
  options?: { ignore: SeriesType[] },
): [$Values<typeof XYSeriesTypeMap>, SeriesType] => {
  const spectType = getXYSeriesTypeKnob(name, value, groupId, options);

  return [XYSeriesTypeMap[spectType], spectType];
};
