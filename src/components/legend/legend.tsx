import React, { createRef } from 'react';
import classNames from 'classnames';
import { isVerticalAxis, isHorizontalAxis } from '../../chart_types/xy_chart/utils/axis_utils';
import { connect } from 'react-redux';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { GlobalChartState } from '../../state/chart_state';
import { getLegendItemsSelector } from '../../state/selectors/get_legend_items';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getLegendItemsValuesSelector } from '../../state/selectors/get_legend_items_values';
import { getLegendSizeSelector } from '../../state/selectors/get_legend_size';
import { onToggleLegend, onLegendItemOver, onLegendItemOut } from '../../state/actions/legend';
import { Dispatch, bindActionCreators } from 'redux';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { LegendListItem } from './legend_item';
import { Theme } from '../../utils/themes/theme';
import { TooltipLegendValue } from '../../chart_types/xy_chart/tooltip/tooltip';
import { AccessorType } from '../../utils/geometry';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { BBox } from '../../utils/bbox/bbox_calculator';

interface LegendProps {
  legendInitialized: boolean;
  isCursorOnChart: boolean; //TODO
  legendItems: Map<string, LegendItem>;
  legendPosition: Position;
  legendItemTooltipValues: Map<string, TooltipLegendValue>;
  showLegend: boolean;
  legendCollapsed: boolean;
  debug: boolean;
  chartTheme: Theme;
  legendSize: BBox;
  toggleLegend: typeof onToggleLegend;
  onLegendItemOut: typeof onLegendItemOut;
  onLegendItemOver: typeof onLegendItemOver;
}

interface LegendStyle {
  maxHeight?: string;
  maxWidth?: string;
  width?: string;
  height?: string;
}

interface LegendListStyle {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  gridTemplateColumns?: string;
}

class LegendComponent extends React.Component<LegendProps> {
  static displayName = 'Legend';
  legendItemCount = 0;

  private echLegend = createRef<HTMLDivElement>();

  render() {
    const { legendInitialized, legendItems, legendPosition, legendSize, showLegend, debug, chartTheme } = this.props;
    if (!showLegend || !legendInitialized || legendItems.size === 0) {
      return null;
    }
    const legendContainerStyle = this.getLegendStyle(legendPosition, legendSize);
    const legendListStyle = this.getLegendListStyle(legendPosition, chartTheme);
    const legendClasses = classNames('echLegend', `echLegend--${legendPosition}`, {
      'echLegend--debug': debug,
      invisible: !legendInitialized,
    });

    return (
      <div ref={this.echLegend} className={legendClasses}>
        <div style={legendContainerStyle} className="echLegendListContainer">
          <div style={legendListStyle} className="echLegendList">
            {[...legendItems.values()].map(this.renderLegendElement)}
          </div>
        </div>
      </div>
    );
  }

  getLegendListStyle = (position: Position, { chartMargins, legend }: Theme): LegendListStyle => {
    const { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight } = chartMargins;

    if (isHorizontalAxis(position)) {
      return {
        paddingLeft,
        paddingRight,
        gridTemplateColumns: `repeat(auto-fill, minmax(${legend.verticalWidth}px, 1fr))`,
      };
    }

    return {
      paddingTop,
      paddingBottom,
    };
  };

  getLegendStyle = (position: Position, size: BBox): LegendStyle => {
    if (isVerticalAxis(position)) {
      const width = `${size.width}px`;
      return {
        width,
        maxWidth: width,
      };
    }
    const height = `${size.height}px`;
    return {
      height,
      maxHeight: height,
    };
  };

  onLegendItemMouseover = (legendItemKey: string) => () => {
    this.props.onLegendItemOver(legendItemKey);
  };

  onLegendItemMouseout = () => {
    this.props.onLegendItemOut();
  };

  private getLegendValues(
    tooltipValues: Map<string, TooltipLegendValue> | undefined,
    key: string,
    banded: boolean = false,
  ): any[] {
    const values = tooltipValues && tooltipValues.get(key);
    if (values === null || values === undefined) {
      return banded ? ['', ''] : [''];
    }

    const { y0, y1 } = values;
    return banded ? [y1, y0] : [y1];
  }

  private getItemLabel({ banded, label, y1AccessorFormat, y0AccessorFormat }: LegendItem, yAccessor: AccessorType) {
    if (!banded) {
      return label;
    }

    return yAccessor === AccessorType.Y1 ? `${label}${y1AccessorFormat}` : `${label}${y0AccessorFormat}`;
  }

  private renderLegendElement = (item: LegendItem) => {
    const { key, displayValue, banded } = item;
    const { isCursorOnChart, legendItemTooltipValues } = this.props;
    const legendValues = this.getLegendValues(legendItemTooltipValues, key, banded);

    return legendValues.map((value, index) => {
      const yAccessor: AccessorType = index === 0 ? AccessorType.Y1 : AccessorType.Y0;
      return (
        <LegendListItem
          {...item}
          label={this.getItemLabel(item, yAccessor)}
          key={`${key}-${yAccessor}`}
          legendItem={item}
          displayValue={isCursorOnChart ? value : displayValue.formatted[yAccessor]}
          onMouseEnter={this.onLegendItemMouseover(key)}
          onMouseLeave={this.onLegendItemMouseout}
        />
      );
    });
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      toggleLegend: onToggleLegend,
      onLegendItemOut,
      onLegendItemOver,
    },
    dispatch,
  );

const mapStateToProps = (state: GlobalChartState) => {
  if (!state.specsInitialized) {
    return {
      legendInitialized: false, //TODO
      isCursorOnChart: false, //TODO
      legendItems: new Map(),
      legendPosition: Position.Right,
      showLegend: false,
      legendCollapsed: false,
      legendItemTooltipValues: new Map(),
      debug: false,
      chartTheme: LIGHT_THEME,
      legendSize: { width: 0, height: 0 },
    };
  }
  const { legendPosition, showLegend, debug } = getSettingsSpecSelector(state);
  const legendItems = getLegendItemsSelector(state);
  return {
    legendInitialized: legendItems.size > 0,
    legendItems,
    isCursorOnChart: true, //TODO
    legendPosition,
    showLegend,
    legendCollapsed: state.interactions.legendCollapsed,
    legendItemTooltipValues: getLegendItemsValuesSelector(state),
    debug,
    chartTheme: getChartThemeSelector(state),
    legendSize: getLegendSizeSelector(state),
  };
};

export const Legend = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LegendComponent);
