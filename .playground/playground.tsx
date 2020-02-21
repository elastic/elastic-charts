import React from 'react';
import { Chart, ScaleType, Settings, BarSeries, DataGenerator, LegendColorPickerFn, Axis } from '../src';

const dg = new DataGenerator();

export class Playground extends React.Component<{}, { isSunburstShown: boolean }> {
  state: any = {
    colors: ['red'],
  };

  data = dg.generateGroupedSeries(10, 4, 'split');
  customColor = '#0c7b93';
  container?: HTMLDivElement;

  legendColorPickerFn: LegendColorPickerFn = (anchor, onClose) => {
    return (
      <div id="colorPicker">
        <span>Custom Color Picker</span>
        <button
          id="change"
          onClick={() => {
            this.setState<any>({ colors: [this.customColor] });
            onClose();
          }}
        >
          {this.customColor}
        </button>
        <button id="close" onClick={onClose}>
          close
        </button>
      </div>
    );
  };

  render() {
    return (
      <>
        <div className="chart">
          <Chart>
            <Axis id="bottom" position="bottom" />
            <Axis id="left" position="left" />
            <Settings showLegend legendColorPicker={this.legendColorPickerFn} />
            <BarSeries
              id="areas"
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor={'x'}
              yAccessors={['y']}
              splitSeriesAccessors={['g']}
              customSeriesColors={this.state.colors}
              data={this.data}
            />
          </Chart>
        </div>
      </>
    );
  }
}
