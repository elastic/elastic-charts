import React from 'react';
import { Chart, Settings, AreaSeries, Axis, Position } from '../src';
export class Playground extends React.Component<{}, { rotation: number }> {
  chartRef: React.RefObject<Chart> = React.createRef();
  state = {
    rotation: 0,
  };
  componentDidMount() {
    setInterval(() => {
      this.setState({
        rotation: this.state.rotation + 5,
      });
    }, 50);
  }

  render() {
    return (
      <>
        <div className="chart">
          <Chart ref={this.chartRef}>
            <Settings rotation={0} />
            <Axis id={'left'} title={'left axis'} position={Position.Left} tickLabelRotation={this.state.rotation} />
            <Axis id={'right'} title={'right axis'} position={Position.Right} tickLabelRotation={this.state.rotation} />
            <Axis id={'top'} title={'top axis'} position={Position.Top} tickLabelRotation={this.state.rotation} />
            <Axis
              id={'bottom'}
              title={'bottom axis'}
              position={Position.Bottom}
              tickLabelRotation={this.state.rotation}
            />
            <AreaSeries
              id="bar3s"
              xAccessor={0}
              yAccessors={[1]}
              data={[
                [0, 2],
                [1, 2],
                [2, 3],
                [3, 4],
              ]}
            />
          </Chart>
        </div>
      </>
    );
  }
}
