/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useMemo } from 'react';
import { fn } from 'storybook/test';

import type { LegendColorPicker, Color, SeriesKey } from '@elastic/charts';
import { Axis, BarSeries, Chart, Position, ScaleType, Settings, toEntries } from '@elastic/charts';
import { BARCHART_1Y1G } from '@elastic/charts/src/utils/data_samples/test_dataset';

import { getColorPicker, useBaseTheme, getLegendAction } from '@ech/sb';

export const Component = ({ onChangeAction, showLegendAction = false }: any, { chartProps }: any) => {
  const [colors, setColors] = useState<Record<SeriesKey, Color | null>>({});

  const CustomColorPicker: LegendColorPicker = useMemo(
    () =>
      ({ anchor, color, onClose, seriesIdentifiers, onChange }) => {
        const handleClose = () => {
          onClose();
          setColors((prevColors) => ({
            ...prevColors,
            ...toEntries(seriesIdentifiers, 'key', color),
          }));
        };
        const handleChange = (c: Color | null) => {
          setColors((prevColors) => ({
            ...prevColors,
            ...toEntries(seriesIdentifiers, 'key', c),
          }));
          onChange(c);
          onChangeAction(c);
        };

        return getColorPicker()({
          anchor,
          color,
          onClose: handleClose,
          onChange: handleChange,
          seriesIdentifiers,
        });
      },
    [setColors, onChangeAction],
  );
  CustomColorPicker.displayName = 'CustomColorPicker';
  return (
    <Chart {...chartProps}>
      <Settings
        showLegend
        legendColorPicker={CustomColorPicker}
        baseTheme={useBaseTheme()}
        legendAction={showLegendAction ? getLegendAction() : undefined}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars 1"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        splitSeriesAccessors={['g']}
        data={BARCHART_1Y1G}
        color={({ key }) => colors[key] ?? null}
      />
    </Chart>
  );
};

const meta = {
  title: 'Specifications/Color Picker',
  component: Component,
  parameters: {
    markdown:
      'Elastic charts will maintain the color selection in memory beyond chart updates. However, to persist colors beyond browser refresh the consumer would need to manage the color state and use the color prop on the SeriesSpec to assign a color via a SeriesColorAccessor.\n\n __Note:__ the context menu, color picker and popover are supplied by [eui](https://elastic.github.io/eui/#).',
  },
  argTypes: {
    showLegendAction: {
      control: { type: 'boolean' },
      description: 'Show legend action',
    },
  },
  args: {
    showLegendAction: false,
    onChangeAction: fn(),
  },
} satisfies Meta<typeof Component>;

export default meta;
// type Story = StoryObj<typeof meta>;
