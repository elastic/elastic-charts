/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useMemo, memo, RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Colors } from '../../common/colors';
import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, DEFAULT_TOOLTIP_SPEC, SettingsSpec, TooltipProps, TooltipSpec } from '../../specs';
import { onPointerMove as onPointerMoveAction } from '../../state/actions/mouse';
import {
  onTooltipItemSelected as onTooltipItemSelectedAction,
  onTooltipPinned as onTooltipPinnedAction,
} from '../../state/actions/tooltip';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { getChartRotationSelector } from '../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSelectedItems } from '../../state/selectors/get_tooltip_selected_items';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { Datum, hasMostlyRTLItems, isDefined, Rotation } from '../../utils/common';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { TooltipStyle } from '../../utils/themes/theme';
import { AnchorPosition, Placement, TooltipPortal, TooltipPortalSettings } from '../portal';
import { TooltipBody } from './components/tooltip_body';
import { TooltipProvider } from './components/tooltip_provider';
import { TooltipTableColumn } from './components/types';
import { TooltipInfo } from './types';

interface TooltipDispatchProps {
  onPointerMove: typeof onPointerMoveAction;
  onTooltipItemSelected:
    | typeof onTooltipItemSelectedAction
    | ((...args: Parameters<typeof onTooltipItemSelectedAction>) => void);
  onTooltipPinned: typeof onTooltipPinnedAction | ((...args: Parameters<typeof onTooltipPinnedAction>) => void);
}

interface TooltipStateProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
  tooltip: TooltipSpec<D, SI>;
  zIndex: number;
  visible: boolean;
  position: AnchorPosition | null;
  info?: TooltipInfo<D, SI>;
  settings?: TooltipProps<D, SI>;
  rotation: Rotation;
  chartId: string;
  backgroundColor: string;
  pinned: boolean;
  selected: Array<SeriesIdentifier>;
  tooltipTheme: TooltipStyle;
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
  tooltip: { header, footer, actions, headerFormatter, actionPrompt, selectionPrompt },
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
  onTooltipItemSelected,
  onTooltipPinned,
}: TooltipComponentProps<D, SI>) => {
  const chartRef = getChartContainerRef();

  const handleScroll = (e: Event) => {
    const target = e.target as Element;
    if (target.classList.contains('echTooltip__tableBody')) {
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

  if (!visible) {
    return null;
  }

  const isMostlyRTL = hasMostlyRTLItems([
    ...(info?.values?.map?.(({ label }) => label) ?? []),
    info?.header?.label ?? '',
  ]);

  const columns: TooltipTableColumn<D, SI>[] = [
    {
      id: 'color',
      type: 'color',
    },
    {
      id: 'label',
      type: 'custom',
      cell: ({ label }) => <span className="echTooltip__label">{label}</span>,
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

  const hideActions =
    (info?.disableActions ?? false) || actions.length === 0 || info?.values.every((v) => v.displayOnly);

  return (
    <TooltipPortal
      scope="MainTooltip"
      // increasing by 100 the tooltip portal zIndex to avoid conflicts with highlighters and other elements in the DOM
      zIndex={zIndex + 100}
      anchor={
        anchorRef ?? {
          position,
          appendRef: chartRef,
        }
      }
      settings={popperSettings}
      chartId={chartId}
      visible={visible}
    >
      <TooltipProvider
        backgroundColor={backgroundColor}
        dir={isMostlyRTL ? 'rtl' : 'ltr'}
        pinned={pinned}
        selected={selected}
        onTooltipPinned={onTooltipPinned}
        theme={tooltipTheme}
      >
        <TooltipBody
          info={info}
          columns={columns}
          headerFormatter={headerFormatter}
          settings={settings}
          visible={visible}
          header={header}
          footer={footer}
          onSelect={onTooltipItemSelected}
          actions={hideActions ? [] : actions}
          actionPrompt={actionPrompt}
          selectionPrompt={selectionPrompt}
        />
      </TooltipProvider>
    </TooltipPortal>
  );
};

TooltipComponent.displayName = 'Tooltip';

function getTooltipSettings(
  tooltip: TooltipSpec,
  { externalPointerEvents }: SettingsSpec,
  isExternalTooltipVisible: boolean,
): TooltipProps {
  if (!isExternalTooltipVisible) return tooltip;

  return {
    ...tooltip,
    ...externalPointerEvents.tooltip,
  };
}

const HIDDEN_TOOLTIP_PROPS: TooltipStateProps = {
  tooltip: DEFAULT_TOOLTIP_SPEC,
  zIndex: 0,
  visible: false,
  info: undefined,
  position: null,
  settings: {},
  rotation: 0 as Rotation,
  chartId: '',
  backgroundColor: Colors.Transparent.keyword,
  pinned: false,
  selected: [],
  tooltipTheme: LIGHT_THEME.tooltip,
};

const mapDispatchToProps = (dispatch: Dispatch): TooltipDispatchProps =>
  bindActionCreators(
    {
      onPointerMove: onPointerMoveAction,
      onTooltipItemSelected: onTooltipItemSelectedAction,
      onTooltipPinned: onTooltipPinnedAction,
    },
    dispatch,
  );

type BasicTooltipProps = Omit<TooltipStateProps, 'visible' | 'position' | 'info' | 'pinned' | 'selected'>;
const mapStateToPropsBasic = (state: GlobalChartState): BasicTooltipProps => {
  const tooltip = getTooltipSpecSelector(state);
  const {
    background: { color: backgroundColor },
    tooltip: tooltipTheme,
  } = getChartThemeSelector(state);
  return getInternalIsInitializedSelector(state) !== InitStatus.Initialized
    ? HIDDEN_TOOLTIP_PROPS
    : {
        tooltip,
        zIndex: state.zIndex,
        settings: getTooltipSettings(
          tooltip,
          getSettingsSpecSelector(state),
          getInternalIsTooltipVisibleSelector(state).isExternal,
        ),
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
      };

/** @internal */
export const Tooltip = memo(connect(mapStateToProps, mapDispatchToProps)(TooltipComponent));

/** @internal */
export const BasicTooltip = memo(connect(mapStateToPropsBasic)(TooltipComponent));
