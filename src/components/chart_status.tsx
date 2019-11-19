import React from 'react';
import { connect } from 'react-redux';
import { GlobalChartState } from '../state/chart_state';

interface ChartStatusStateProps {
  chartRendered: boolean;
  chartRenderedCount: number;
}
class ChartStatusComponent extends React.Component<ChartStatusStateProps> {
  render() {
    const { chartRendered, chartRenderedCount } = this.props;
    return (
      <div
        className="echChartStatus"
        data-ech-render-complete={chartRendered}
        data-ech-render-count={chartRenderedCount}
      />
    );
  }
}

const mapDispatchToProps = () => ({});

const mapStateToProps = (state: GlobalChartState) => {
  return {
    chartRendered: state.chartRendered,
    chartRenderedCount: state.chartRenderedCount,
  };
};

export const ChartStatus = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartStatusComponent);
