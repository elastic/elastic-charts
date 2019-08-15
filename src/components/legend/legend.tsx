import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { isVertical } from '../../chart_types/xy_chart/utils/axis_utils';
import { LegendItem as SeriesLegendItem } from '../../chart_types/xy_chart/legend/legend';
import { ChartStore } from '../../chart_types/xy_chart/store/chart_state';
import { Position } from '../../chart_types/xy_chart/utils/specs';
import { LegendItem } from './legend_item';
import { Theme } from '../../utils/themes/theme';

interface LegendProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
  legendId: string;
}

interface PaddingStyle {
  paddingTop?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;
  paddingRight?: number | string;
}

class LegendComponent extends React.Component<LegendProps> {
  static displayName = 'Legend';

  render() {
    const { legendId } = this.props;
    const {
      legendInitialized,
      chartInitialized,
      legendItems,
      legendPosition,
      showLegend,
      debug,
      chartTheme,
    } = this.props.chartStore!;

    if (!showLegend.get() || !legendInitialized.get() || legendItems.size === 0) {
      return null;
    }

    const paddingStyle = this.getPaddingStyle(legendPosition.get(), chartTheme);
    const legendClasses = classNames('echLegend', `echLegend--${legendPosition}`, {
      'echLegend--debug': debug,
      invisible: !chartInitialized.get(),
    });

    return (
      <div className={legendClasses} style={paddingStyle} id={legendId}>
        <div className="echLegendListContainer">
          <div className="echLegendList">{[...legendItems.values()].map(this.renderLegendElement)}</div>
        </div>
      </div>
    );
  }

  getPaddingStyle = (position: Position, { chartMargins }: Theme): PaddingStyle => {
    if (isVertical(position)) {
      return {
        paddingTop: chartMargins.top,
        paddingBottom: chartMargins.bottom,
      };
    }

    return {
      paddingLeft: chartMargins.left,
      paddingRight: chartMargins.right,
    };
  };

  onLegendItemMouseover = (legendItemKey: string) => () => {
    this.props.chartStore!.onLegendItemOver(legendItemKey);
  };

  onLegendItemMouseout = () => {
    this.props.chartStore!.onLegendItemOut();
  };

  private renderLegendElement = (item: SeriesLegendItem) => {
    const { key, displayValue } = item;
    const tooltipValues = this.props.chartStore!.legendItemTooltipValues.get();
    let tooltipValue;

    if (tooltipValues && tooltipValues.get(key)) {
      tooltipValue = tooltipValues.get(key);
    }

    const newDisplayValue = tooltipValue != null ? tooltipValue : displayValue.formatted;

    return (
      <LegendItem
        {...item}
        key={key}
        legendItemKey={key}
        displayValue={newDisplayValue}
        onMouseEnter={this.onLegendItemMouseover(key)}
        onMouseLeave={this.onLegendItemMouseout}
      />
    );
  };
}

export const Legend = inject('chartStore')(observer(LegendComponent));
