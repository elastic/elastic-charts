/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  EuiIcon,
  EuiPopover,
  EuiContextMenu,
  EuiContextMenuPanelDescriptor,
  EuiWrappingPopover,
  EuiColorPicker,
  EuiSpacer,
  EuiButton,
  PopoverAnchorPosition,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
} from '@elastic/eui';
import { boolean, number } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  Position,
  ScaleType,
  Settings,
  LegendAction,
  XYChartSeriesIdentifier,
  LegendColorPicker,
  LegendLabelOptions,
} from '@elastic/charts';
import * as TestDatasets from '@elastic/charts/src/utils/data_samples/test_dataset';

import { useBaseTheme } from '../../use_base_theme';
import { getPositionKnob, getEuiPopoverPositionKnob } from '../utils/knobs';

const getAction = (anchorPosition: PopoverAnchorPosition): LegendAction => ({ series, label }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const getPanels = (series: XYChartSeriesIdentifier[]): EuiContextMenuPanelDescriptor[] => [
    {
      id: 0,
      title: label,
      items: [
        {
          name: 'Alert series specId',
          icon: <EuiIcon type="iInCircle" size="m" />,
          onClick: () => {
            setPopoverOpen(false);
            setTimeout(() => {
              window.alert(`Selected series: ${series.map(({ specId }) => specId).join(', ')}`);
            }, 100);
          },
        },
        {
          name: 'Alert series keys',
          icon: <EuiIcon type="tokenKey" size="m" />,
          onClick: () => {
            setPopoverOpen(false);
            setTimeout(() => {
              window.alert(`Selected series: [${series.map(({ seriesKeys }) => seriesKeys.join(', ')).join(' -- ')}]`);
            }, 100);
          },
        },
        {
          name: 'Filter series',
          icon: <EuiIcon type="filter" size="m" />,
          onClick: () => {
            setPopoverOpen(false);
            setTimeout(() => {
              window.alert('Series Filtered!');
            }, 100);
          },
        },
        {
          name: 'Like series',
          icon: <EuiIcon type="starFilled" size="m" />,
          onClick: () => {
            setPopoverOpen(false);
            setTimeout(() => {
              window.alert('Series liked!!!');
            }, 100);
          },
        },
      ],
    },
  ];

  const Button = (
    <button
      type="button"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 2,
        paddingRight: 2,
      }}
      onClick={() => setPopoverOpen(!popoverOpen)}
    >
      <EuiIcon size="s" type="pencil" />
    </button>
  );

  return (
    <EuiPopover
      id="contextMenuNormal"
      button={Button}
      isOpen={popoverOpen}
      closePopover={() => setPopoverOpen(false)}
      panelPaddingSize="none"
      offset={4}
      anchorPosition={anchorPosition}
      ownFocus
    >
      <EuiContextMenu initialPanelId={0} panels={getPanels(series as XYChartSeriesIdentifier[])} />
    </EuiPopover>
  );
};

export const renderEuiColorPicker = (anchorPosition: PopoverAnchorPosition): LegendColorPicker => ({
  anchor,
  color,
  onClose,
  onChange,
}) => (
  <EuiWrappingPopover isOpen button={anchor} closePopover={onClose} anchorPosition={anchorPosition} ownFocus>
    <EuiColorPicker display="inline" color={color} onChange={onChange} />
    <EuiSpacer size="m" />
    <EuiFlexGroup gutterSize="none" alignItems="center" direction="row">
      <EuiFlexItem grow={false}>
        <EuiButton size="s" fill onClick={onClose} title="Confirm color selection">
          Done
        </EuiButton>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiSpacer size="m" />
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          display="base"
          iconType="cross"
          color="danger"
          title="Clear color selection"
          onClick={() => {
            onChange(null);
            onClose();
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiWrappingPopover>
);

const getLabelOptionKnobs = (): LegendLabelOptions => {
  const group = 'Label options';

  return {
    maxLines: number('max label lines', 1, { min: 0, step: 1 }, group),
  };
};

export const Example = () => {
  const hideActions = boolean('Hide legend action', false, 'Legend');
  const showLegendExtra = !boolean('Hide legend extra', false, 'Legend');
  const showColorPicker = !boolean('Hide color picker', true, 'Legend');
  const legendPosition = getPositionKnob('Legend position', undefined, 'Legend');
  const euiPopoverPosition = getEuiPopoverPositionKnob(undefined, undefined, 'Legend');
  const labelOptions = getLabelOptionKnobs();

  return (
    <Chart>
      <Settings
        showLegend
        theme={{ legend: { labelOptions } }}
        baseTheme={useBaseTheme()}
        showLegendExtra={showLegendExtra}
        legendPosition={legendPosition}
        legendAction={hideActions ? undefined : getAction(euiPopoverPosition)}
        legendColorPicker={showColorPicker ? renderEuiColorPicker(euiPopoverPosition) : undefined}
      />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g1', 'g2']}
        data={TestDatasets.BARCHART_2Y2G}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown:
    'The `legendAction` action prop allows you to pass a render function/component that will render next to the legend item.\n\n __Note:__ the context menu, color picker and popover are supplied by [eui](https://elastic.github.io/eui/#).',
};
