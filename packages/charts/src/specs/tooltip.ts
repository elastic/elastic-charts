/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ComponentType, ReactNode } from 'react';

import { TooltipStickTo, TooltipType } from './constants';
import { SettingsSpec } from './settings';
import { Spec } from './spec';
import { SpecType } from './spec_type';
import { ChartType } from '../chart_types/chart_type';
import { BaseDatum } from '../chart_types/specs';
import { Color } from '../common/colors';
import { SeriesIdentifier } from '../common/series_id';
import { TooltipPortalSettings } from '../components/portal';
import { CustomTooltip } from '../components/tooltip';
import { SFProps } from '../state/build_props_types';
import { buildSFProps } from '../state/build_sf_props';
import { useSpecFactory } from '../state/spec_factory';
import { PointerValue } from '../state/types';
import { Datum } from '../utils/common';
import { stripUndefined } from '../utils/common';
import { SeriesCompareFn } from '../utils/series_sort';

/**
 * This interface describe the properties of single value shown in the tooltip
 * @public
 */
export interface TooltipValue<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>
  extends PointerValue<D> {
  /**
   * The label of the tooltip value
   */
  label: string;
  /**
   * The mark value
   */
  markValue?: number | null;
  /**
   * The mark value to display
   */
  formattedMarkValue?: string | null;
  /**
   * The color of the graphic mark (by default the color of the series)
   */
  color: Color;
  /**
   * True if the mouse is over the graphic mark connected to the tooltip
   */
  isHighlighted: boolean;
  /**
   * True if the tooltip is visible, false otherwise
   */
  isVisible: boolean;
  /**
   * The identifier of the related series
   */
  seriesIdentifier: SI;
  /**
   * The datum associated with the current tooltip value
   * Maybe not available
   */
  datum?: D;
  /**
   * Internal flag used to simplify interactions for heatmap tooltip
   * TODO: replace this flag with better internal tooltip info structures
   * @internal
   */
  displayOnly?: boolean;
}

/**
 * A value formatter of a {@link TooltipValue}
 * @public
 */
export type TooltipValueFormatter<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = (
  data: TooltipValue<D, SI>,
) => JSX.Element | string;

/**
 * A header formatter of tooltip {@link PointerValue}
 * @public
 */
export type TooltipHeaderFormatter<D extends BaseDatum = Datum> = (data: PointerValue<D>) => JSX.Element | string;

/** @internal */
export function isCrosshairTooltipType(type: TooltipType) {
  return type === TooltipType.VerticalCursor || type === TooltipType.Crosshairs;
}

/** @internal */
export function isFollowTooltipType(type: TooltipType) {
  return type === TooltipType.Follow;
}

/** @internal */
export function getTooltipType(tooltip: TooltipSpec, settings: SettingsSpec, externalTooltip = false): TooltipType {
  if (!externalTooltip) return tooltip.type;
  const { visible } = settings.externalPointerEvents.tooltip;
  return visible ? TooltipType.VerticalCursor : TooltipType.None;
}

/**
 * Tooltip action parameters
 * @public
 */
export type TooltipAction<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = {
  /**
   * Clickable label to display action
   */
  label: string | ((selected: TooltipValue<D, SI>[], allItems: TooltipValue<D, SI>[]) => ReactNode);
  /**
   * Hides action from list
   */
  hide?: (selected: TooltipValue<D, SI>[], allItems: TooltipValue<D, SI>[]) => boolean;
  /**
   * Disables action when true or string description is passed
   * If a string is passed, it will be used as the title to display reason for disablement
   */
  disabled?: (selected: TooltipValue<D, SI>[], allItems: TooltipValue<D, SI>[]) => boolean | string;
  /**
   * Callback trigger when action is selected
   */
  onSelect: (selected: TooltipValue<D, SI>[], allItems: TooltipValue<D, SI>[]) => void;
};

/**
 * Spec used to configure tooltip for chart
 * @public
 */
export interface TooltipSpec<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>
  extends Spec,
    TooltipPortalSettings<'chart'> {
  /**
   * The {@link (TooltipType:type) | TooltipType} of the tooltip
   * @defaultValue vertical
   */
  type: TooltipType;

  /**
   * Whenever the tooltip needs to snap to the x/band position or not
   * @defaultValue true
   */
  snap: boolean;

  /**
   * A {@link TooltipHeaderFormatter} to format the header value. Ignored when header is defined.
   */
  headerFormatter?: TooltipHeaderFormatter<D>;

  /**
   * Unit for event (i.e. `time`, `feet`, `count`, etc.).
   * Not currently used/implemented
   *
   * @alpha
   */
  unit?: string;

  /**
   * Render custom tooltip given header and values
   */
  customTooltip?: CustomTooltip<D, SI>;

  /**
   * Stick the tooltip to a specific position within the current cursor
   * @defaultValue mousePosition
   */
  stickTo?: TooltipStickTo;

  /**
   * Show null values on the tooltip
   * @defaultValue false
   */
  showNullValues: boolean;

  /**
   * Custom header for tooltip. Ignored when used with `customTooltip`.
   * Note: This is not the table headers but spans the entire tooltip.
   */
  header: 'default' | 'none' | ComponentType<{ items: TooltipValue<D, SI>[]; header: PointerValue<D> | null }>;

  /**
   * Custom body for tooltip. Ignored when used with `customTooltip`.
   * Note: This is not the table body but spans the entire tooltip.
   */
  body: 'default' | 'none' | ComponentType<{ items: TooltipValue<D, SI>[]; header: PointerValue<D> | null }>;
  /**
   * Custom footer for tooltip. Ignored when used with `customTooltip`.
   * Note: This is not the table footers but spans the entire tooltip.
   */
  footer: 'default' | 'none' | ComponentType<{ items: TooltipValue<D, SI>[]; header: PointerValue<D> | null }>;

  /**
   * Actions to enable tooltip selection
   */
  actions:
    | TooltipAction<D, SI>[]
    | ((selected: TooltipValue<D, SI>[]) => Promise<TooltipAction<D, SI>[]> | TooltipAction<D, SI>[]);

  /**
   * Shown in place of actions UI while loading async actions
   */
  actionsLoading: string | ComponentType<{ selected: TooltipValue<D, SI>[] }>;

  /**
   * Shown in place of actions UI after loading async actions and finding none
   */
  noActionsLoaded: string | ComponentType<{ selected: TooltipValue<D, SI>[] }>;

  /**
   * Prompt displayed to indicate user can right-click for contextual menu
   */
  actionPrompt: string;

  /**
   * Prompt displayed to indicate user can right-click for contextual menu
   */
  pinningPrompt: string;

  /**
   * Prompt displayed when tooltip is pinned but all actions are hidden
   */
  selectionPrompt: string;

  /**
   * Max number of tooltip items before showing only highlighted values
   */
  maxTooltipItems: number;

  /**
   * Max number of visible tooltip items before scrolling. Does not apply to custom tooltips
   */
  maxVisibleTooltipItems: number;

  /**
   * A SeriesSortFn to sort the tooltip values (top-bottom)
   */
  sort?: SeriesCompareFn;
}

/**
 * Configure tooltip for chart
 * @public
 */
export const tooltipBuildProps = buildSFProps<TooltipSpec>()(
  {
    id: '__global__tooltip___' as const,
    chartType: ChartType.Global,
    specType: SpecType.Tooltip,
  },
  {
    type: TooltipType.VerticalCursor,
    snap: true,
    showNullValues: false,
    actions: [],
    actionPrompt: 'Right-click to show actions',
    pinningPrompt: 'Right-click to pin tooltip',
    selectionPrompt: 'Please select a series',
    actionsLoading: 'Loading Actions...',
    noActionsLoaded: 'No actions available',
    maxTooltipItems: 10,
    maxVisibleTooltipItems: 10,
    header: 'default',
    body: 'default',
    footer: 'default',
  },
);

/** @public */
export const DEFAULT_TOOLTIP_SPEC: TooltipSpec = {
  ...tooltipBuildProps.defaults,
  ...tooltipBuildProps.overrides,
};

/**
 * Adds settings spec to chart specs
 * @public
 */
export const Tooltip = function <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>(
  props: SFProps<
    TooltipSpec<D, SI>,
    keyof (typeof tooltipBuildProps)['overrides'],
    keyof (typeof tooltipBuildProps)['defaults'],
    keyof (typeof tooltipBuildProps)['optionals'],
    keyof (typeof tooltipBuildProps)['requires']
  >,
) {
  const { defaults, overrides } = tooltipBuildProps;
  // @ts-ignore - default generic value
  useSpecFactory<TooltipSpec<D, SI>>({
    ...defaults,
    ...stripUndefined(props),
    ...overrides,
  });
  return null;
};

/**
 * This interface describe the properties of single value shown in the tooltip
 * @public
 */
export type TooltipProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = SFProps<
  TooltipSpec<D, SI>,
  keyof (typeof tooltipBuildProps)['overrides'],
  keyof (typeof tooltipBuildProps)['defaults'],
  keyof (typeof tooltipBuildProps)['optionals'],
  keyof (typeof tooltipBuildProps)['requires']
>;
