import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React, { createRef } from 'react';
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

interface LegendState {
  width?: number;
}

interface HorizontalLegendStyle {
  paddingLeft: number | string;
  paddingRight: number | string;
  height: string;
}

interface VerticalLegendStyle {
  paddingTop: number | string;
  paddingBottom: number | string;
  maxWidth: string;
  width?: string;
}

class LegendComponent extends React.Component<LegendProps, LegendState> {
  static displayName = 'Legend';

  state = {
    width: undefined,
  };

  private echLegend = createRef<HTMLDivElement>();

  componentDidUpdate() {
    const { chartInitialized, chartTheme, legendPosition } = this.props.chartStore!;
    if (
      this.echLegend.current &&
      isVertical(legendPosition.get()) &&
      this.state.width === undefined &&
      !chartInitialized.get()
    ) {
      const buffer = chartTheme.legend.legendSpacingBuffer;

      this.setState({
        width: this.echLegend.current.offsetWidth + buffer,
      });
    }
  }

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

    const style = {
      ...this.getLegendStyle(legendPosition.get(), chartTheme),
    };
    const legendClasses = classNames('echLegend', `echLegend--${legendPosition}`, {
      'echLegend--debug': debug,
      invisible: !chartInitialized.get(),
    });

    return (
      <div ref={this.echLegend} className={legendClasses} style={style} id={legendId}>
        <div className="echLegendListContainer">
          <div className="echLegendList">{[...legendItems.values()].map(this.renderLegendElement)}</div>
        </div>
      </div>
    );
  }

  getLegendStyle = (
    position: Position,
    { chartMargins, legend }: Theme,
  ): HorizontalLegendStyle | VerticalLegendStyle => {
    const { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight } = chartMargins;

    if (isVertical(position)) {
      if (this.state.width !== undefined) {
        const threshold = Math.min(this.state.width!, legend.verticalWidth);
        const width = `${threshold}px`;

        return {
          width,
          maxWidth: width,
          paddingTop,
          paddingBottom,
        };
      }

      return {
        maxWidth: `${legend.verticalWidth}px`,
        paddingTop,
        paddingBottom,
      };
    }

    return {
      paddingLeft,
      paddingRight,
      height: `${legend.horizontalHeight}px`,
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
    const { legendPosition, legendItemTooltipValues } = this.props.chartStore!;
    const tooltipValues = legendItemTooltipValues.get();
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
        legendPosition={legendPosition.get()}
        displayValue={newDisplayValue}
        onMouseEnter={this.onLegendItemMouseover(key)}
        onMouseLeave={this.onLegendItemMouseout}
      />
    );
  };
}

export const Legend = inject('chartStore')(observer(LegendComponent));
