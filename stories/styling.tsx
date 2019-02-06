import { boolean, color, number, select } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  Axis,
  BarSeries,
  Chart,
  DARK_THEME,
  getAxisId,
  getSpecId,
  LIGHT_THEME,
  mergeWithDefaultTheme,
  PartialTheme,
  Position,
  ScaleType,
  Settings,
} from '../src/';

function range(title: string, min: number, max: number, value: number, groupId?: string) {
  return number(
    title,
    value,
    {
      range: true,
      min,
      max,
      step: 1,
    },
    groupId,
  );
}

storiesOf('Stylings', module)
  .add('margins and paddings', () => {
    const theme: PartialTheme = {
      chartMargins: {
        left: range('margin left', 0, 50, 10),
        right: range('margin right', 0, 50, 10),
        top: range('margin top', 0, 50, 10),
        bottom: range('margin bottom', 0, 50, 10),
      },
      chartPaddings: {
        left: range('padding left', 0, 50, 10),
        right: range('padding right', 0, 50, 10),
        top: range('padding top', 0, 50, 10),
        bottom: range('padding bottom', 0, 50, 10),
      },
    };

    const darkmode = boolean('darkmode', false);
    const className = darkmode ? 'story-chart-dark' : 'story-chart';
    const defaultTheme = darkmode ? DARK_THEME : LIGHT_THEME;
    const customTheme = mergeWithDefaultTheme(theme, defaultTheme);

    return (
      <Chart renderer="canvas" className={className}>
        <Settings
          theme={customTheme}
          debug={boolean('debug', true)}
          showLegend={true}
          legendPosition={Position.Right}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
          showGridLines={boolean('show bottom axis grid lines', false)}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
          showGridLines={boolean('show left axis grid lines', false)}
        />
        <Axis
          id={getAxisId('top')}
          position={Position.Top}
          title={'Top axis'}
          showOverlappingTicks={true}
          showGridLines={boolean('show top axis grid lines', false)}
        />
        <Axis
          id={getAxisId('right')}
          title={'Right axis'}
          position={Position.Right}
          tickFormat={(d) => Number(d).toFixed(2)}
          showGridLines={boolean('show right axis grid lines', false)}
        />
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('axis', () => {
    const theme: PartialTheme = {
      axes: {
        axisTitleStyle: {
          fill: color('titleFill', '#333', 'Axis Title'),
          fontSize: range('titleFontSize', 0, 40, 12, 'Axis Title'),
          fontStyle: 'bold',
          fontFamily: `'Open Sans', Helvetica, Arial, sans-serif`,
          padding: range('titlePadding', 0, 40, 5, 'Axis Title'),
        },
        axisLineStyle: {
          stroke: color('axisLinecolor', '#333', 'Axis Line'),
          strokeWidth: range('axisLineWidth', 0, 5, 1, 'Axis Line'),
        },
        tickLabelStyle: {
          fill: color('tickFill', '#333', 'Tick Label'),
          fontSize: range('tickFontSize', 0, 40, 10, 'Tick Label'),
          fontFamily: `'Open Sans', Helvetica, Arial, sans-serif`,
          fontStyle: 'normal',
          padding: 0,
        },
        tickLineStyle: {
          stroke: color('tickLineColor', '#333', 'Tick Line'),
          strokeWidth: range('tickLineWidth', 0, 5, 1, 'Tick Line'),
        },
      },
    };
    const customTheme = mergeWithDefaultTheme(theme, LIGHT_THEME);
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings
          theme={customTheme}
          debug={boolean('debug', true)}
          rotation={select('rotation', { '0': 0, '90': 90, '-90': -90, '180': 180 }, 0)}
        />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  });
