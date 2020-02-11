import React from 'react';
import { Chart, ScaleType, Settings, BarSeries, DataGenerator } from '../src';
import { RenderColorPicker } from '../src/components/legend/legend_item';

export class Playground extends React.Component<{}, { isSunburstShown: boolean }> {
  render() {
    const dg = new DataGenerator();
    const data = dg.generateGroupedSeries(10, 4, 'split');
    const renderColorPicker: RenderColorPicker = (onChange, onClose, isOpen, button) =>
      isOpen ? (
        <div id="colorPicker">
          <span>Custom Color Picker</span>
          <button id="change" onClick={() => onChange('#0c7b93')}>
            #0c7b93
          </button>
          <button id="close" onClick={onClose}>
            close
          </button>
          {button}
        </div>
      ) : (
        { button }
      );

    return (
      <div className="chart">
        <Chart>
          <Settings showLegend renderColorPicker={renderColorPicker} />
          <BarSeries
            id="areas"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={'x'}
            yAccessors={['y']}
            splitSeriesAccessors={['g']}
            data={data}
          />
        </Chart>
      </div>
    );
  }
}
