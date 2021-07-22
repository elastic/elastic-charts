/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiColorPicker, EuiWrappingPopover, EuiButton, EuiSpacer, EuiFlexItem, EuiButtonEmpty } from '@elastic/eui';
import { action } from '@storybook/addon-actions';
import React, { useState, useMemo } from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  LegendColorPicker,
  Color,
  SeriesKey,
  toEntries,
} from '@elastic/charts';
import { BARCHART_1Y1G } from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';

const onChangeAction = action('onChange');
const onCloseAction = action('onClose');

export const Example = () => {
  const [colors, setColors] = useState<Record<SeriesKey, Color | null>>({});
  const CustomColorPicker: LegendColorPicker = useMemo(
    () =>
      ({ anchor, color, onClose, seriesIdentifiers, onChange }) => {
        const handleClose = () => {
          onClose();
          onCloseAction();
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

        return (
          <>
            <EuiWrappingPopover isOpen button={anchor} closePopover={handleClose} anchorPosition="leftCenter" ownFocus>
              <EuiColorPicker display="inline" color={color} onChange={handleChange} />
              <EuiSpacer size="m" />
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty size="s" onClick={() => handleChange(null)}>
                  Clear color
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiButton fullWidth size="s" onClick={handleClose}>
                Done
              </EuiButton>
            </EuiWrappingPopover>
          </>
        );
      },
    [setColors],
  );
  CustomColorPicker.displayName = 'CustomColorPicker';
  return (
    <Chart>
      <Settings showLegend legendColorPicker={CustomColorPicker} baseTheme={useBaseTheme()} />
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

Example.parameters = {
  markdown:
    'Elastic charts will maintain the color selection in memory beyond chart updates. However, to persist colors beyond browser refresh the consumer would need to manage the color state and use the color prop on the SeriesSpec to assign a color via a SeriesColorAccessor.\n\n __Note:__ the context menu, color picker and popover are supplied by [eui](https://elastic.github.io/eui/#).',
};
