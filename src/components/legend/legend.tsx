import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { isVertical } from '../../lib/axes/axis_utils';
import { LegendItem as SeriesLegendItem } from '../../lib/series/legend';
import { ChartStore } from '../../state/chart_state';
import { LegendItem } from './legend_item';

interface ReactiveChartProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}

class LegendComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'Legend';

  onCollapseLegend = () => {
    this.props.chartStore!.toggleLegendCollapsed();
  }

  render() {
    const {
      initialized,
      legendItems,
      legendPosition,
      showLegend,
      legendCollapsed,
      debug,
      chartTheme,
    } = this.props.chartStore!;

    if (
      !showLegend.get() ||
      !initialized.get() ||
      legendItems.size === 0 ||
      legendPosition === undefined
    ) {
      return null;
    }

    const legendClasses = classNames('echLegend', `echLegend--${legendPosition}`, {
      'echLegend--collapsed': legendCollapsed.get(),
      'echLegend--debug': debug,
    });
    let paddingStyle;
    if (isVertical(legendPosition)) {
      paddingStyle = {
        paddingTop: chartTheme.chartMargins.top,
        paddingBottom: chartTheme.chartMargins.bottom,
      };
    } else {
      paddingStyle = {
        paddingLeft: chartTheme.chartMargins.left,
        paddingRight: chartTheme.chartMargins.right,
      };
    }
    return (
      <div className={legendClasses} style={paddingStyle}>
        <div className="echLegendListContainer">
          <div className="echLegendList">
            {[...legendItems.values()].map((item) => {
              // const { isLegendItemVisible } = item;

              // const legendItemProps = {
              //   key: item.key,
              //   className: classNames('echLegendList__item', {
              //     'echLegendList__item--hidden': !isLegendItemVisible,
              //   }),
              //   onMouseEnter: this.onLegendItemMouseover(item.key),
              //   onMouseLeave: this.onLegendItemMouseout,
              // };

              return this.renderLegendElement(
                item,
                item.key,
                this.onLegendItemMouseover(item.key),
                this.onLegendItemMouseout,
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  onLegendItemMouseover = (legendItemKey: string) => () => {
    this.props.chartStore!.onLegendItemOver(legendItemKey);
  }

  onLegendItemMouseout = () => {
    this.props.chartStore!.onLegendItemOut();
  }

  private renderLegendElement = (
    { color, label, isSeriesVisible, displayValue }: SeriesLegendItem,
    legendItemKey: string,
    onMouseEnter: (event: React.MouseEvent) => void,
    onMouseLeave: () => void,
  ) => {
    const tooltipValues = this.props.chartStore!.legendItemTooltipValues.get();
    let tooltipValue;

    if (tooltipValues && tooltipValues.get(legendItemKey)) {
      tooltipValue = tooltipValues.get(legendItemKey);
    }

    const display = tooltipValue != null ? tooltipValue : displayValue.formatted;
    const props = { color, label, isSeriesVisible, legendItemKey, displayValue: display };

    return (
      <LegendItem
        {...props}
        key={legendItemKey}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    );
  }
}

export const Legend = inject('chartStore')(observer(LegendComponent));
