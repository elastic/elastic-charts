import classNames from 'classnames';
import React, { createRef } from 'react';
import { isVerticalAxis, isHorizontalAxis } from '../../chart_types/xy_chart/utils/axis_utils';
import { connect } from 'react-redux';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { GlobalChartState } from '../../state/chart_state';
import { getLegendItemsSelector } from '../../state/selectors/get_legend_items';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getLegendItemsValuesSelector } from '../../state/selectors/get_legend_items_values';
import { onToggleLegend, onLegendItemOver, onLegendItemOut, onLegendRendered } from '../../state/actions/legend';
import { Dispatch, bindActionCreators } from 'redux';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { LegendListItem } from './legend_item';
import { Theme } from '../../utils/themes/theme';
import { TooltipLegendValue } from '../../chart_types/xy_chart/tooltip/tooltip';
import { AccessorType } from '../../utils/geometry';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { Dimensions } from 'utils/dimensions';

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
  toggleLegend: () => void;
  onLegendItemOut: () => void;
  onLegendItemOver: (legendItem: string) => void;
  onLegendRendered: (bbox?: Dimensions) => void;
}

interface LegendState {
  width?: number;
}

interface LegendStyle {
  maxHeight?: string;
  maxWidth?: string;
  width?: string;
}

interface LegendListStyle {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
  gridTemplateColumns?: string;
}

class LegendComponent extends React.Component<LegendProps, LegendState> {
  static displayName = 'Legend';
  state = {
    width: undefined,
  };
  private echLegend = createRef<HTMLDivElement>();

  componentDidUpdate() {
    const { chartTheme, legendPosition } = this.props;
    if (this.echLegend.current && isVerticalAxis(legendPosition) && this.state.width === undefined) {
      const buffer = chartTheme.legend.spacingBuffer;

      this.setState({
        width: this.echLegend.current.offsetWidth + buffer,
      });
    }
    this.props.onLegendRendered();
  }

  render() {
    const { legendInitialized, legendItems, legendPosition, showLegend, debug, chartTheme } = this.props;

    if (!showLegend || !legendInitialized || legendItems.size === 0) {
      return null;
    }
    const legendContainerStyle = this.getLegendStyle(legendPosition, chartTheme);
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

  getLegendStyle = (position: Position, { legend }: Theme): LegendStyle => {
    if (isVerticalAxis(position)) {
      if (this.state.width !== undefined) {
        const threshold = Math.min(this.state.width!, legend.verticalWidth);
        const width = `${threshold}px`;

        return {
          width,
          maxWidth: width,
        };
      }

      return {
        maxWidth: `${legend.verticalWidth}px`,
      };
    }

    return {
      maxHeight: `${legend.horizontalHeight}px`,
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
      onLegendRendered,
    },
    dispatch,
  );

const mapStateToProps = (state: GlobalChartState) => {
  if (!state.initialized) {
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
    };
  }
  const { legendPosition, showLegend, debug } = getSettingsSpecSelector(state);
  const legendItems = getLegendItemsSelector(state);
  return {
    legendInitialized: legendItems.size > 0,
    legendItems,
    isCursorOnChart: false, //TODO
    legendPosition,
    showLegend,
    legendCollapsed: state.interactions.legendCollapsed,
    legendItemTooltipValues: getLegendItemsValuesSelector(state),
    debug,
    chartTheme: getChartThemeSelector(state),
  };
};

export const Legend = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LegendComponent);
