/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { EuiIcon, EuiPopover, EuiContextMenu, EuiContextMenuPanelDescriptor } from '@elastic/eui';
import { boolean } from '@storybook/addon-knobs';
import React, { useState } from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings, LegendAction, XYChartSeriesIdentifier } from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';
import { getPositionKnob } from '../utils/knobs';

export const Example = () => {
  const hideActions = boolean('Hide actions', false);
  const [popoverId, setPopoverId] = useState<string | null>(null);

  const getPanels = (series: XYChartSeriesIdentifier, onClose: () => void): EuiContextMenuPanelDescriptor[] => [
    {
      id: 0,
      title: 'Legend Actions',
      items: [
        {
          name: 'Alert series specId',
          icon: <EuiIcon type="iInCircle" size="m" />,
          onClick: () => {
            setPopoverId(null);
            onClose();
            setTimeout(() => {
              window.alert(`Selected series: ${series.specId}`);
            }, 100);
          },
        },
        {
          name: 'Alert series keys',
          icon: <EuiIcon type="tokenKey" size="m" />,
          onClick: () => {
            setPopoverId(null);
            onClose();
            setTimeout(() => {
              window.alert(`Selected series: [${series.seriesKeys.join(', ')}]`);
            }, 100);
          },
        },
        {
          name: 'Filter series',
          icon: <EuiIcon type="filter" size="m" />,
          onClick: () => {
            setPopoverId(null);
            onClose();
            setTimeout(() => {
              window.alert('Series Filtered!');
            }, 100);
          },
        },
        {
          name: 'Like series',
          icon: <EuiIcon type="starFilled" size="m" />,
          onClick: () => {
            setPopoverId(null);
            onClose();
            setTimeout(() => {
              window.alert('Series liked!!!');
            }, 100);
          },
        },
      ],
    },
  ];

  const getButton = (key: string, onOpen: () => void, onClose: () => void) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        marginLeft: 4,
        marginRight: 4,
      }}
      onClick={() => {
        if (key === popoverId) {
          setPopoverId(null);
          onClose();
        } else {
          setPopoverId(key);
          onOpen();
        }
      }}
    >
      <EuiIcon size="s" type="pencil" />
    </div>
  );

  const Action: LegendAction = ({ onOpen, onClose, seriesIdentifier }) => (
    <EuiPopover
      id="contextMenuNormal"
      button={hideActions ? <div /> : getButton(seriesIdentifier.key, onOpen, onClose)}
      isOpen={popoverId === seriesIdentifier.key}
      closePopover={() => {
        setPopoverId(null);
        onClose();
      }}
      panelPaddingSize="none"
      withTitle
      anchorPosition="upLeft"
    >
      <EuiContextMenu
        initialPanelId={0}
        panels={getPanels(seriesIdentifier as XYChartSeriesIdentifier, onClose)}
      />
    </EuiPopover>
  );

  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={getPositionKnob()} legendAction={Action} />
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

Example.story = {
  parameters: {
    info: {
      text:
        `The \`legendAction\` action prop allows you to pass a render function/component that will render next to the legend item.


The \`onOpen\` and \`onClose\` props of the \`LegendAction\` component should be used when it is desirable to persist the action after clicked.
For example when using an action with a popover context menu. Without using \`onOpen\` and \`onClose\` the action element will only appear when
the item is hovered over`,
    },
  },
};
