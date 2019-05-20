import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { ChartStore } from '../../state/chart_state';

interface ReactiveChartProps {
  chartStore?: ChartStore;
}

class LegendButtonComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'Legend';
  onCollapseLegend = () => {
    this.props.chartStore!.toggleLegendCollapsed();
  }

  render() {
    const { initialized, legendItems, legendCollapsed, showLegend } = this.props.chartStore!;

    if (!showLegend.get() || !initialized.get() || legendItems.size === 0) {
      return null;
    }
    const isOpen = !legendCollapsed.get();
    const className = classNames('echLegend__toggle', {
      'echLegend__toggle--isOpen': isOpen,
    });
    return (
      <div
        className={className}
        onClick={this.onCollapseLegend}
        // iconType="list"
        aria-label={legendCollapsed.get() ? 'Expand legend' : 'Collapse legend'}
      />
    );
  }
}

export const LegendButton = inject('chartStore')(observer(LegendButtonComponent));
