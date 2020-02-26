import React, { useState } from 'react';
import { number } from '@storybook/addon-knobs';

import { EuiColorPicker, EuiWrappingPopover } from '@elastic/eui';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, PartialTheme, LegendColorPicker } from '../../src/';
import { SeededDataGenerator } from '../../src/mocks/utils';

const dg = new SeededDataGenerator();

export const example = () => {
  const theme: PartialTheme = {
    legend: {
      spacingBuffer: number('legend buffer value', 80),
    },
  };
  const data = dg.generateGroupedSeries(5, 2);
  const [colors, setColors] = useState<Record<string, string>>({});

  const renderColorPicker: LegendColorPicker = ({ anchor, color, onClose, seriesIdentifier }) => {
    const handleChange = (color: string) => {
      onClose();
      setColors({
        ...colors,
        [seriesIdentifier.key]: color,
      });
    };
    return (
      <EuiWrappingPopover isOpen button={anchor} closePopover={onClose}>
        <EuiColorPicker color={color} onChange={handleChange}></EuiColorPicker>
      </EuiWrappingPopover>
    );
  };

  return (
    <Chart className="story-chart">
      <Settings theme={theme} showLegend legendColorPicker={renderColorPicker} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={data}
        customSeriesColors={({ key }) => colors[key] ?? null}
      />
    </Chart>
  );
};
