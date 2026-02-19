/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { CustomLegend } from './custom_legend';
import { LegendList } from './legend_list';
import { LegendTable } from './legend_table';
import { getLegendPositionConfig, legendPositionStyle } from './position_style';
import { getLegendStyle, getLegendListStyle } from './style_utils';
import type { LegendItemProps } from './types';
import { ActionFocusProvider } from './use_action_focus_management';
import type { LegendItem, LegendItemExtraValues } from '../../common/legend';
import { shouldDisplayGridList } from '../../common/legend';
import { shouldDisplayTable } from '../../common/legend';
import type { SeriesIdentifier } from '../../common/series_id';
import type { LegendSpec } from '../../specs';
import { DEFAULT_LEGEND_CONFIG } from '../../specs';
import { clearTemporaryColors, setTemporaryColor, setPersistedColor } from '../../state/actions/colors';
import type { LegendPath } from '../../state/actions/legend';
import {
  onToggleDeselectSeriesAction,
  onLegendItemOutAction,
  onLegendItemOverAction,
} from '../../state/actions/legend';
import type { GlobalChartState } from '../../state/chart_state';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getInternalMainProjectionAreaSelector } from '../../state/selectors/get_internal_main_projection_area';
import { getLegendConfigSelector } from '../../state/selectors/get_legend_config_selector';
import { getLegendExtraValuesSelector } from '../../state/selectors/get_legend_items_values';
import { getLegendMaxFormattedValueWidthSelector } from '../../state/selectors/get_legend_max_formatted_value';
import { getLegendSizeSelector } from '../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { isBrushingSelector } from '../../state/selectors/is_brushing';
import { hasMostlyRTLItems, HorizontalAlignment, LayoutDirection, VerticalAlignment } from '../../utils/common';
import type { Dimensions, Size } from '../../utils/dimensions';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import type { Theme } from '../../utils/themes/theme';

interface LegendStateProps {
  debug: boolean;
  isBrushing: boolean;
  chartDimensions: Dimensions;
  containerDimensions: Dimensions;
  chartTheme: Theme;
  size: Size & { seriesWidth?: number };
  config: LegendSpec;
  items: LegendItem[];
  extraValues: Map<string, LegendItemExtraValues>;
  maxFormattedValueWidth?: number;
}

interface LegendDispatchProps {
  onItemOutAction: typeof onLegendItemOutAction;
  onItemOverAction: typeof onLegendItemOverAction;
  onToggleDeselectSeriesAction: typeof onToggleDeselectSeriesAction;
  clearTemporaryColors: typeof clearTemporaryColors;
  setTemporaryColor: typeof setTemporaryColor;
  setPersistedColor: typeof setPersistedColor;
}

function LegendComponent(props: LegendStateProps & LegendDispatchProps) {
  const {
    items,
    size,
    debug,
    isBrushing,
    chartTheme: { chartMargins, legend },
    chartDimensions,
    containerDimensions,
    config,
    maxFormattedValueWidth,
  } = props;

  const { onLegendItemOut, onLegendItemOver, legendLayout, legendPosition } = config;
  const { onItemOutAction, onItemOverAction } = props;

  const onLegendItemMouseOver = useCallback(
    (seriesIdentifiers: SeriesIdentifier[], path: LegendPath) => {
      // call the settings listener directly if available
      if (onLegendItemOver) {
        onLegendItemOver(seriesIdentifiers);
      }
      onItemOverAction(path);
    },
    [onItemOverAction, onLegendItemOver],
  );

  const onLegendItemMouseOut = useCallback(() => {
    // call the settings listener directly if available
    if (onLegendItemOut) {
      onLegendItemOut();
    }
    onItemOutAction();
  }, [onLegendItemOut, onItemOutAction]);

  if (items.every(({ isItemHidden }) => isItemHidden)) {
    return null;
  }

  const positionConfig = getLegendPositionConfig(config.legendPosition);
  const containerStyle = getLegendStyle(positionConfig, size, legend.margin);
  const listStyle = getLegendListStyle(positionConfig, chartMargins, legend, items.length);
  const isMostlyRTL = hasMostlyRTLItems(items.map(({ label }) => label));

  const legendClasses = classNames('echLegend', {
    'echLegend--debug': debug,
    'echLegend--inert': isBrushing,
    'echLegend--horizontal': positionConfig.direction === LayoutDirection.Horizontal,
    'echLegend--vertical': positionConfig.direction === LayoutDirection.Vertical,
    'echLegend--left': positionConfig.hAlign === HorizontalAlignment.Left,
    'echLegend--right': positionConfig.hAlign === HorizontalAlignment.Right,
    'echLegend--top': positionConfig.vAlign === VerticalAlignment.Top,
    'echLegend--bottom': positionConfig.vAlign === VerticalAlignment.Bottom,
  });

  const itemProps: Omit<LegendItemProps, 'item'> = {
    positionConfig,
    isMostlyRTL,
    totalItems: items.length,
    hiddenItems: items.filter(({ isSeriesHidden }) => isSeriesHidden).length,
    extraValues: props.extraValues,
    legendValues: config.legendValues,
    onLegendItemMouseOver,
    onLegendItemMouseOut,
    onClick: config.onLegendItemClick,
    clearTemporaryColorsAction: props.clearTemporaryColors,
    setPersistedColorAction: props.setPersistedColor,
    setTemporaryColorAction: props.setTemporaryColor,
    toggleDeselectSeriesAction: props.onToggleDeselectSeriesAction,
    colorPicker: config.legendColorPicker,
    action: config.legendAction,
    legendActionOnHover: config.legendActionOnHover ?? DEFAULT_LEGEND_CONFIG.legendActionOnHover,
    labelOptions: legend.labelOptions,
    flatLegend: config.flatLegend ?? DEFAULT_LEGEND_CONFIG.flatLegend,
    legendTitle: config.legendTitle,
  };

  const positionStyle = legendPositionStyle(config, size, chartDimensions, containerDimensions);
  const isTableView = shouldDisplayTable(itemProps.legendValues, legendPosition, legendLayout);
  const isGridListView = shouldDisplayGridList(isTableView, legendPosition, legendLayout);
  const actionFocusEnabled = Boolean(config.legendAction);

  return (
    <ActionFocusProvider enabled={actionFocusEnabled}>
      <div className={legendClasses} style={positionStyle} dir={isMostlyRTL ? 'rtl' : 'ltr'}>
        {config.customLegend ? (
          <div style={containerStyle}>
            <CustomLegend
              component={config.customLegend}
              items={items.map(({ seriesIdentifiers, childId, path, ...customProps }) => ({
                ...customProps,
                seriesIdentifiers,
                path,
                extraValue: itemProps.extraValues.get(seriesIdentifiers[0]?.key ?? '')?.get(childId ?? ''),
                onItemOutAction,
                onItemOverActon: () => onItemOverAction(path),
                onItemClickAction: (negate: boolean) =>
                  itemProps.toggleDeselectSeriesAction({ legendItemIds: seriesIdentifiers, metaKey: negate }),
              }))}
            />
          </div>
        ) : isTableView ? (
          <div style={containerStyle} className="echLegendTable__container">
            <LegendTable items={items} {...itemProps} seriesWidth={size.seriesWidth} />
          </div>
        ) : isGridListView ? (
          <div style={containerStyle} className="echLegendGridListContainer">
            <ul style={listStyle} className="echLegendGridList">
              {items.map((item, index) => (
                <LegendList key={`${index}`} item={item} {...itemProps} />
              ))}
            </ul>
          </div>
        ) : (
          <div style={containerStyle} className="echLegendListContainer">
            <ul style={listStyle} className="echLegendList">
              {items.map((item, index) => (
                <LegendList
                  key={`${index}`}
                  item={item}
                  {...itemProps}
                  isListLayout
                  maxFormattedValueWidth={maxFormattedValueWidth}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </ActionFocusProvider>
  );
}

const mapDispatchToProps = (dispatch: Dispatch): LegendDispatchProps =>
  bindActionCreators(
    {
      onToggleDeselectSeriesAction,
      onItemOutAction: onLegendItemOutAction,
      onItemOverAction: onLegendItemOverAction,
      clearTemporaryColors,
      setTemporaryColor,
      setPersistedColor,
    },
    dispatch,
  );

const EMPTY_DEFAULT_STATE: LegendStateProps = {
  chartDimensions: { width: 0, height: 0, left: 0, top: 0 },
  containerDimensions: { width: 0, height: 0, left: 0, top: 0 },
  items: [],
  extraValues: new Map(),
  debug: false,
  isBrushing: false,
  chartTheme: LIGHT_THEME,
  size: { width: 0, height: 0 },
  config: DEFAULT_LEGEND_CONFIG,
};

const mapStateToProps = (state: GlobalChartState): LegendStateProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState === null || getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return EMPTY_DEFAULT_STATE;
  }
  const config = getLegendConfigSelector(state);
  if (!config.showLegend) {
    return EMPTY_DEFAULT_STATE;
  }
  const { debug } = getSettingsSpecSelector(state);
  return {
    debug,
    isBrushing: isBrushingSelector(state),
    chartDimensions: getInternalMainProjectionAreaSelector(state),
    containerDimensions: internalChartState.getProjectionContainerArea(state),
    chartTheme: getChartThemeSelector(state),
    size: getLegendSizeSelector(state),
    items: internalChartState.getLegendItems(state),
    extraValues: getLegendExtraValuesSelector(state),
    maxFormattedValueWidth: getLegendMaxFormattedValueWidthSelector(state),
    config,
  };
};

/** @internal */
export const Legend = connect(mapStateToProps, mapDispatchToProps)(LegendComponent);
