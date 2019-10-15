import React from 'react';
import { connect } from 'react-redux';
import { GlobalChartState } from '../state/chart_state';

interface ChartStateProps {
  legendRendered: boolean;
  chartRendered: boolean;
  chartRenderedCount: number;
}
class ChartStateComponent extends React.Component<ChartStateProps> {
  render() {
    const { legendRendered, chartRendered, chartRenderedCount } = this.props;
    return (
      <div
        className="echChartState"
        data-ech-legend-rendered={legendRendered}
        data-ech-render-complete={chartRendered}
        data-ech-render-count={chartRenderedCount}
      />
    );
  }
}

const mapDispatchToProps = () => ({});

const mapStateToProps = (state: GlobalChartState) => {
  return {
    legendRendered: state.legendRendered,
    chartRendered: state.chartRendered,
    chartRenderedCount: state.chartRenderedCount,
  };
};

export const ChartState = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartStateComponent);
