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

import { TooltipTableColumn } from '.';
import { Colors } from '../../common/colors';
import { SettingsSpec, TooltipProps, TooltipSpec, TooltipValueFormatter } from '../../specs';
import { onPointerMove as onPointerMoveAction } from '../../state/actions/mouse';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { getChartRotationSelector } from '../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { hasMostlyRTLItems, isDefined, Rotation } from '../../utils/common';
import { AnchorPosition, Placement, TooltipPortal, TooltipPortalSettings } from '../portal';
import { TooltipBody } from './components/tooltip_body';
import { TooltipProvider } from './components/tooltip_provider';
import { TooltipInfo } from './types';

interface TooltipDispatchProps {
  onPointerMove: typeof onPointerMoveAction;
}

interface TooltipStateProps {
  zIndex: number;
  visible: boolean;
  position: AnchorPosition | null;
  info?: TooltipInfo;
  headerFormatter?: TooltipValueFormatter;
  settings?: TooltipProps;
  rotation: Rotation;
  chartId: string;
  backgroundColor: string;
}

interface TooltipOwnProps {
  getChartContainerRef: BackwardRef;
  anchorRef?: RefObject<HTMLDivElement>;
}

type TooltipComponentProps = TooltipDispatchProps & TooltipStateProps & TooltipOwnProps;

/** @internal */
export const TooltipComponent = ({
  anchorRef,
  info,
  zIndex,
  headerFormatter,
  position,
  getChartContainerRef,
  settings,
  visible,
  rotation,
  chartId,
  onPointerMove,
  backgroundColor,
}: TooltipComponentProps) => {
  const chartRef = getChartContainerRef();

  const handleScroll = () => {
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

  const columns: TooltipTableColumn[] = [
    {
      id: 'label',
      renderCell: ({ label }) => <span className="echTooltip__label">{label}</span>,
      style: {
        textAlign: 'left',
      },
    },
    {
      id: 'value',
      renderCell: ({ formattedValue }) => (
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
      style: {
        paddingLeft: 0,
      },
      hidden: (items) => items.every(({ markValue }) => !markValue),
      renderCell: ({ markValue, formattedMarkValue }) =>
        isDefined(markValue) ? <span className="echTooltip__markValue">&nbsp;({formattedMarkValue})</span> : null,
    },
  ];

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
      <TooltipProvider backgroundColor={backgroundColor} dir={isMostlyRTL ? 'rtl' : 'ltr'}>
        <TooltipBody
          info={info}
          columns={columns}
          headerFormatter={headerFormatter}
          settings={settings}
          visible={visible}
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

const HIDDEN_TOOLTIP_PROPS = {
  zIndex: 0,
  visible: false,
  info: undefined,
  position: null,
  headerFormatter: undefined,
  settings: {},
  rotation: 0 as Rotation,
  chartId: '',
  backgroundColor: Colors.Transparent.keyword,
};

const mapDispatchToProps = (dispatch: Dispatch): TooltipDispatchProps =>
  bindActionCreators({ onPointerMove: onPointerMoveAction }, dispatch);

const mapStateToPropsBasic = (state: GlobalChartState): Omit<TooltipStateProps, 'visible' | 'position' | 'info'> => {
  const tooltip = getTooltipSpecSelector(state);
  return getInternalIsInitializedSelector(state) !== InitStatus.Initialized
    ? HIDDEN_TOOLTIP_PROPS
    : {
        zIndex: state.zIndex,
        headerFormatter: tooltip.headerFormatter,
        settings: getTooltipSettings(
          tooltip,
          getSettingsSpecSelector(state),
          getInternalIsTooltipVisibleSelector(state).isExternal,
        ),
        rotation: getChartRotationSelector(state),
        chartId: state.chartId,
        backgroundColor: getChartThemeSelector(state).background.color,
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
      };

/** @internal */
export const Tooltip = memo(connect(mapStateToProps, mapDispatchToProps)(TooltipComponent));

/** @internal */
export const BasicTooltip = memo(connect(mapStateToPropsBasic)(TooltipComponent));
