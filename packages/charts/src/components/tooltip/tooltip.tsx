/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Placement as PopperPlacement } from '@popperjs/core';
import React, { useEffect, useMemo, memo, RefObject, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  computeTableMaxHeight,
  TooltipDivider,
  TooltipFooter,
  TooltipHeader,
  Table,
  TooltipWrapper,
} from './components';
import { TooltipProvider } from './components/tooltip_provider';
import { getStylesFromPlacement } from './placement';
import {
  PinTooltipCallback,
  SetSelectedTooltipItemsCallback,
  ToggleSelectedTooltipItemCallback,
  TooltipInfo,
} from './types';
import { Colors } from '../../common/colors';
import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, DEFAULT_TOOLTIP_SPEC, TooltipProps, TooltipSpec, TooltipValue } from '../../specs';
import { onPointerMove as onPointerMoveAction } from '../../state/actions/mouse';
import {
  toggleSelectedTooltipItem as toggleSelectedTooltipItemAction,
  setSelectedTooltipItems as setSelectedTooltipItemsAction,
  pinTooltip as pinTooltipAction,
} from '../../state/actions/tooltip';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { isPinnableTooltip } from '../../state/selectors/can_pin_tooltip';
import { getChartRotationSelector } from '../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getTooltipSelectedItems } from '../../state/selectors/get_tooltip_selected_items';
import { getTooltipSettings } from '../../state/selectors/get_tooltip_settings';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { isBrushingSelector } from '../../state/selectors/is_brushing';
import { Datum, hasMostlyRTLItems, isDefined, Rotation } from '../../utils/common';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { TooltipStyle } from '../../utils/themes/theme';
import { AnchorPosition, Placement, TooltipPortal, TooltipPortalSettings } from '../portal';
import { TableColumn } from '../table/types';

interface TooltipDispatchProps {
  onPointerMove: typeof onPointerMoveAction;
  toggleSelectedTooltipItem: ToggleSelectedTooltipItemCallback;
  setSelectedTooltipItems: SetSelectedTooltipItemsCallback;
  pinTooltip: PinTooltipCallback;
}

interface TooltipStateProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
  tooltip: TooltipSpec<D, SI>;
  zIndex: number;
  visible: boolean;
  isExternal: boolean;
  position: AnchorPosition | null;
  info?: TooltipInfo<D, SI>;
  settings?: TooltipProps<D, SI>;
  rotation: Rotation;
  chartId: string;
  canPinTooltip: boolean;
  backgroundColor: string;
  pinned: boolean;
  selected: TooltipValue<D, SI>[];
  tooltipTheme: TooltipStyle;
  isBrushing: boolean;
}

interface TooltipOwnProps {
  getChartContainerRef: BackwardRef;
  anchorRef?: RefObject<HTMLDivElement>;
}

/** @internal */
export type TooltipComponentProps<
  D extends BaseDatum = Datum,
  SI extends SeriesIdentifier = SeriesIdentifier,
> = TooltipDispatchProps & TooltipStateProps<D, SI> & TooltipOwnProps;

/** @internal */
export const TooltipComponent = <D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier>({
  tooltip: {
    header: TooltipCustomHeader,
    body: TooltipCustomBody,
    footer: TooltipCustomFooter,
    actions,
    headerFormatter,
    actionPrompt,
    pinningPrompt,
    selectionPrompt,
    actionsLoading,
    noActionsLoaded,
    maxVisibleTooltipItems,
  },
  anchorRef,
  info,
  zIndex,
  position,
  getChartContainerRef,
  settings,
  tooltipTheme,
  visible,
  rotation,
  chartId,
  onPointerMove,
  backgroundColor,
  pinned,
  selected,
  toggleSelectedTooltipItem,
  setSelectedTooltipItems,
  pinTooltip,
  canPinTooltip,
  isBrushing,
}: TooltipComponentProps<D, SI>) => {
  const [computedPlacement, setComputedPlacement] = useState<PopperPlacement | undefined>(settings?.placement);
  const chartRef = getChartContainerRef();

  const handleScroll = (e: Event) => {
    if (
      e.target &&
      e.target.hasOwnProperty('classList') &&
      (e.target as Element).classList.contains('echTooltip__tableBody')
    ) {
      // catch scroll when scrolling on tableBody
      e.stopImmediatePropagation();
      return;
    }
    // TODO: handle scroll cursor update
    onPointerMove({ x: -1, y: -1 }, Date.now());
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const popperSettings = useMemo((): TooltipPortalSettings | undefined => {
    if (!settings || typeof settings === 'string') {
      return;
    }

    const { placement, fallbackPlacements, boundary, ...rest } = settings;

    return {
      ...rest,
      placement: placement ?? (rotation === 0 || rotation === 180 ? Placement.Right : Placement.Top),
      fallbackPlacements:
        fallbackPlacements ??
        (rotation === 0 || rotation === 180
          ? [Placement.Right, Placement.Left, Placement.Top, Placement.Bottom]
          : [Placement.Top, Placement.Bottom, Placement.Right, Placement.Left]),
      boundary: boundary === 'chart' ? chartRef.current ?? undefined : boundary,
    };
  }, [settings, chartRef, rotation]);

  if (!visible || isBrushing) {
    return null;
  }

  const isMostlyRTL = hasMostlyRTLItems(info?.values?.map?.(({ label }) => label) ?? []);
  const textDirectionality = isMostlyRTL ? 'rtl' : 'ltr';

  const columns: TableColumn<D, SI>[] = [
    {
      id: 'color',
      type: 'color',
    },
    {
      id: 'label',
      type: 'custom',
      truncate: true,
      cell: ({ label }) => (
        <span className="echTooltip__label" title={label}>
          {label}
        </span>
      ),
      hidden: (items) => items.every(({ label }) => !label),
      style: {
        textAlign: 'left',
      },
    },
    {
      id: 'value',
      type: 'custom',
      cell: ({ formattedValue }) => (
        <span className="echTooltip__value" dir="ltr">
          {formattedValue}
        </span>
      ),
      // truncation is fine for values  due to the grid configuration: label-value  as auto-auto.
      // The value will be truncated at 50% of the max tooltip width (at ~125px) only if both exceed the 50% of the available space.
      // It got a plenty of space to render correctly any number even with no formatting
      truncate: true,
      style: {
        textAlign: 'right',
      },
    },
    {
      id: 'markValue',
      type: 'custom',
      style: {
        paddingLeft: 0,
      },
      hidden: (items) => items.every(({ markValue }) => !markValue),
      cell: ({ markValue, formattedMarkValue }) =>
        isDefined(markValue) ? <span className="echTooltip__markValue">&nbsp;({formattedMarkValue})</span> : null,
    },
  ];

  // don't show the tooltip if hidden or no TooltipInfo are available
  if (!info || !visible) {
    return null;
  }

  const hideActions = (info?.disableActions ?? false) || info?.values.every((v) => v.displayOnly);
  const actionable = actions.length > 0 || !Array.isArray(actions);
  // divider visibility
  const hasHeader = TooltipCustomHeader !== 'none' && info.header;
  const hasBody = TooltipCustomBody !== 'none' && info.values.length > 0;
  // footer is empty by default, so default and none are the same at the moment
  const hasFooter = TooltipCustomFooter !== 'default' && TooltipCustomFooter !== 'none';
  const headerBottomDividerVisibility = hasHeader && (hasBody || hasFooter);
  const bodyBottomDividerVisibility = hasBody && hasFooter;

  return (
    <TooltipPortal
      scope="MainTooltip"
      // increasing by 100 the tooltip portal zIndex to avoid conflicts with highlighters and other elements in the DOM
      zIndex={zIndex + 100}
      anchor={anchorRef ?? { position, appendRef: chartRef }}
      settings={popperSettings}
      chartId={chartId}
      visible={visible}
      onPlacementChange={setComputedPlacement}
    >
      <TooltipProvider
        backgroundColor={backgroundColor}
        dir={textDirectionality}
        pinned={pinned}
        actionable={actionable}
        canPinTooltip={canPinTooltip}
        selected={selected}
        setSelection={setSelectedTooltipItems}
        toggleSelected={toggleSelectedTooltipItem}
        values={info?.values ?? []}
        pinTooltip={pinTooltip}
        theme={tooltipTheme}
        maxItems={maxVisibleTooltipItems}
      >
        <div
          className="echTooltip__outerWrapper"
          style={getStylesFromPlacement(actionable, tooltipTheme, computedPlacement)}
        >
          {settings?.customTooltip ? (
            <settings.customTooltip
              {...info}
              dir={textDirectionality}
              pinned={pinned}
              selected={selected}
              setSelection={setSelectedTooltipItems}
              toggleSelected={toggleSelectedTooltipItem}
              headerFormatter={headerFormatter}
              backgroundColor={backgroundColor}
            />
          ) : (
            <TooltipWrapper
              actions={hideActions || !canPinTooltip ? [] : actions}
              actionPrompt={actionPrompt}
              pinningPrompt={pinningPrompt}
              selectionPrompt={selectionPrompt}
              actionsLoading={actionsLoading}
              noActionsLoaded={noActionsLoaded}
            >
              {TooltipCustomHeader === 'none' ? null : TooltipCustomHeader === 'default' ? (
                <TooltipHeader header={info.header} formatter={headerFormatter} />
              ) : (
                <TooltipHeader>
                  <TooltipCustomHeader items={info.values} header={info.header} />
                </TooltipHeader>
              )}

              {headerBottomDividerVisibility && <TooltipDivider />}

              {TooltipCustomBody === 'none' ? null : TooltipCustomBody === 'default' ? (
                <Table
                  columns={columns}
                  items={info.values}
                  pinned={pinned}
                  onSelect={toggleSelectedTooltipItem}
                  selected={selected}
                  maxHeight={computeTableMaxHeight(
                    pinned,
                    columns,
                    tooltipTheme.maxTableHeight,
                    maxVisibleTooltipItems,
                  )}
                />
              ) : (
                <TooltipCustomBody items={info.values} header={info.header} />
              )}

              {bodyBottomDividerVisibility && <TooltipDivider />}

              {TooltipCustomFooter === 'default' || TooltipCustomFooter === 'none' ? null : (
                <TooltipFooter>
                  <TooltipCustomFooter items={info.values} header={info.header} />
                </TooltipFooter>
              )}
            </TooltipWrapper>
          )}
        </div>
      </TooltipProvider>
    </TooltipPortal>
  );
};

TooltipComponent.displayName = 'Tooltip';

const HIDDEN_TOOLTIP_PROPS: TooltipStateProps = {
  tooltip: DEFAULT_TOOLTIP_SPEC,
  zIndex: 0,
  visible: false,
  isExternal: false,
  info: undefined,
  position: null,
  settings: {},
  rotation: 0 as Rotation,
  chartId: '',
  canPinTooltip: false,
  backgroundColor: Colors.Transparent.keyword,
  pinned: false,
  selected: [],
  tooltipTheme: LIGHT_THEME.tooltip,
  isBrushing: false,
};

const mapDispatchToProps = (dispatch: Dispatch): TooltipDispatchProps =>
  bindActionCreators(
    {
      onPointerMove: onPointerMoveAction,
      toggleSelectedTooltipItem: toggleSelectedTooltipItemAction,
      setSelectedTooltipItems: setSelectedTooltipItemsAction,
      pinTooltip: pinTooltipAction,
    },
    dispatch,
  );

type BasicTooltipProps = Omit<
  TooltipStateProps,
  'visible' | 'position' | 'info' | 'pinned' | 'selected' | 'canPinTooltip'
>;
const mapStateToPropsBasic = (state: GlobalChartState): BasicTooltipProps => {
  const tooltip = getTooltipSpecSelector(state);
  const {
    background: { color: backgroundColor },
    tooltip: tooltipTheme,
  } = getChartThemeSelector(state);
  const { isExternal } = getInternalIsTooltipVisibleSelector(state);
  return getInternalIsInitializedSelector(state) !== InitStatus.Initialized
    ? HIDDEN_TOOLTIP_PROPS
    : {
        tooltip,
        isExternal,
        isBrushing: false,
        zIndex: state.zIndex,
        settings: getTooltipSettings(state),
        tooltipTheme,
        rotation: getChartRotationSelector(state),
        chartId: state.chartId,
        backgroundColor,
      };
};

const mapStateToProps = (state: GlobalChartState): TooltipStateProps =>
  getInternalIsInitializedSelector(state) !== InitStatus.Initialized
    ? HIDDEN_TOOLTIP_PROPS
    : {
        ...mapStateToPropsBasic(state),
        visible: getInternalIsTooltipVisibleSelector(state).visible,
        position: getInternalTooltipAnchorPositionSelector(state),
        info: getInternalTooltipInfoSelector(state),
        pinned: state.interactions.tooltip.pinned,
        selected: getTooltipSelectedItems(state),
        canPinTooltip: isPinnableTooltip(state),
        isBrushing: isBrushingSelector(state),
      };

/** @internal */
export const Tooltip = memo(connect(mapStateToProps, mapDispatchToProps)(TooltipComponent));

/** @internal */
export const BasicTooltip = memo(connect(mapStateToPropsBasic)(TooltipComponent));
