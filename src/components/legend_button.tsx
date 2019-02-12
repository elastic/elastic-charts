import { EuiButtonIcon } from '@elastic/eui';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { ChartStore } from '../state/chart_state';

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

    if (!showLegend.get() || !initialized.get() || legendItems.length === 0) {
      return null;
    }
    const isOpen = !legendCollapsed.get();
    const classes = classNames(
      'elasticChartsLegend__toggle',
      isOpen && 'elasticChartsLegend__toggle--isOpen',
    );
    return (
      <EuiButtonIcon
        className={classes}
        onClick={this.onCollapseLegend}
        iconType="list"
        aria-label={legendCollapsed.get() ? 'Expand legend' : 'Collapse legend'}
      />
    );
  }
}

export const LegendButton = inject('chartStore')(observer(LegendButtonComponent));
