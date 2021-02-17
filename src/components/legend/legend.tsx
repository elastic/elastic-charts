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

import classNames from 'classnames';
import React, { CSSProperties } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { computeChartDimensionsSelector } from '../../chart_types/xy_chart/state/selectors/compute_chart_dimensions';
import { LegendItem, LegendItemExtraValues } from '../../common/legend';
import { LegendItemListener, BasicListener, LegendColorPicker, LegendAction, SettingsSpec } from '../../specs';
import { clearTemporaryColors, setTemporaryColor, setPersistedColor } from '../../state/actions/colors';
import {
  onToggleDeselectSeriesAction,
  onLegendItemOutAction,
  onLegendItemOverAction,
} from '../../state/actions/legend';
import { GlobalChartState } from '../../state/chart_state';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getInternalProjectionContainerAreaSelector } from '../../state/selectors/get_internal_projection_container_area';
import { getLegendItemsSelector } from '../../state/selectors/get_legend_items';
import { getLegendExtraValuesSelector } from '../../state/selectors/get_legend_items_values';
import { getLegendSizeSelector } from '../../state/selectors/get_legend_size';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { BBox } from '../../utils/bbox/bbox_calculator';
import { Position } from '../../utils/common';
import { Dimensions } from '../../utils/dimensions';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { Theme } from '../../utils/themes/theme';
import { LegendItemProps, renderLegendItem } from './legend_item';
import { getLegendStyle, getLegendListStyle } from './style_utils';

interface LegendStateProps {
  debug: boolean;
  chartDimensions: Dimensions;
  containerDimensions: Dimensions;
  chartTheme: Theme;
  size: BBox;
  position: SettingsSpec['legendPosition'];
  items: LegendItem[];
  showExtra: boolean;
  extraValues: Map<string, LegendItemExtraValues>;
  colorPicker?: LegendColorPicker;
  action?: LegendAction;
  onItemOver?: LegendItemListener;
  onItemOut?: BasicListener;
  onItemClick?: LegendItemListener;
}
interface LegendDispatchProps {
  onItemOutAction: typeof onLegendItemOutAction;
  onItemOverAction: typeof onLegendItemOverAction;
  onToggleDeselectSeriesAction: typeof onToggleDeselectSeriesAction;
  clearTemporaryColors: typeof clearTemporaryColors;
  setTemporaryColor: typeof setTemporaryColor;
  setPersistedColor: typeof setPersistedColor;
}

function isInsideChartPosition(
  position: SettingsSpec['legendPosition'],
): position is [typeof Position.Top | typeof Position.Bottom, typeof Position.Left | typeof Position.Right] {
  return Array.isArray(position);
}

function LegendComponent(props: LegendStateProps & LegendDispatchProps) {
  const {
    items,
    size,
    debug,
    chartTheme: { chartMargins, legend },
    chartDimensions,
    containerDimensions,
  } = props;
  if (items.length === 0) {
    return null;
  }
  const position = isInsideChartPosition(props.position) ? props.position[1] : props.position;
  const legendContainerStyle = getLegendStyle(position, size, legend.margin);
  const legendListStyle = getLegendListStyle(position, chartMargins, legend);
  const legendClasses = classNames('echLegend', `echLegend--${position}`, {
    'echLegend--debug': debug,
  });

  const itemProps: Omit<LegendItemProps, 'item'> = {
    position,
    totalItems: items.length,
    extraValues: props.extraValues,
    showExtra: props.showExtra,
    onMouseOut: props.onItemOut,
    onMouseOver: props.onItemOver,
    onClick: props.onItemClick,
    clearTemporaryColorsAction: props.clearTemporaryColors,
    setPersistedColorAction: props.setPersistedColor,
    setTemporaryColorAction: props.setTemporaryColor,
    mouseOutAction: props.onItemOutAction,
    mouseOverAction: props.onItemOverAction,
    toggleDeselectSeriesAction: props.onToggleDeselectSeriesAction,
    colorPicker: props.colorPicker,
    action: props.action,
  };
  const INSIDE_PADDING = 10;
  const legendStyle: CSSProperties = isInsideChartPosition(props.position)
    ? {
        position: 'absolute',
        zIndex: 1,
        left: props.position[1] === Position.Left ? `${chartDimensions.left + INSIDE_PADDING}px` : undefined,
        right:
          props.position[1] === Position.Right
            ? `${containerDimensions.width - chartDimensions.width - chartDimensions.left + INSIDE_PADDING}px`
            : undefined,
        top: props.position[0] === Position.Top ? `${chartDimensions.top}px` : undefined,
        bottom:
          props.position[0] === Position.Bottom
            ? `${containerDimensions.height - chartDimensions.top - chartDimensions.height}px`
            : undefined,
      }
    : {};

  return (
    <div className={legendClasses} style={legendStyle}>
      <div style={legendContainerStyle} className="echLegendListContainer">
        <ul style={legendListStyle} className="echLegendList">
          {items.map((item, index) => renderLegendItem(item, itemProps, items.length, index))}
        </ul>
      </div>
    </div>
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

const EMPTY_DEFAULT_STATE = {
  chartDimensions: { width: 0, height: 0, left: 0, top: 0 },
  containerDimensions: { width: 0, height: 0, left: 0, top: 0 },
  items: [],
  position: Position.Right,
  extraValues: new Map(),
  debug: false,
  chartTheme: LIGHT_THEME,
  size: { width: 0, height: 0 },
  showExtra: false,
};

const mapStateToProps = (state: GlobalChartState): LegendStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return EMPTY_DEFAULT_STATE;
  }
  const {
    legendPosition,
    showLegend,
    showLegendExtra,
    debug,
    legendColorPicker,
    legendAction,
    onLegendItemOver: onItemOver,
    onLegendItemOut: onItemOut,
    onLegendItemClick: onItemClick,
  } = getSettingsSpecSelector(state);
  if (!showLegend) {
    return EMPTY_DEFAULT_STATE;
  }

  return {
    debug,
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    containerDimensions: getInternalProjectionContainerAreaSelector(state),
    chartTheme: getChartThemeSelector(state),
    size: getLegendSizeSelector(state),
    items: getLegendItemsSelector(state),
    position: legendPosition,
    showExtra: showLegendExtra,
    extraValues: getLegendExtraValuesSelector(state),
    colorPicker: legendColorPicker,
    action: legendAction,
    onItemOver,
    onItemOut,
    onItemClick,
  };
};

/** @internal */
export const Legend = connect(mapStateToProps, mapDispatchToProps)(LegendComponent);
