/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { PopoverAnchorPosition, EuiContextMenuPanelDescriptor } from '@elastic/eui';
import { EuiIcon, EuiPopover, EuiContextMenu } from '@elastic/eui';
import React, { useState } from 'react';

import type { LegendAction, XYChartSeriesIdentifier } from '@elastic/charts';
import { useLegendAction } from '@elastic/charts';

export const getLegendAction =
  (anchorPosition: PopoverAnchorPosition = 'leftCenter'): LegendAction =>
  ({ series, label }) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [ref, onClose] = useLegendAction<HTMLButtonElement>();

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
                window.alert(
                  `Selected series: [${series.map(({ seriesKeys }) => seriesKeys.join(', ')).join(' -- ')}]`,
                );
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
        ref={ref}
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
        closePopover={() => {
          setPopoverOpen(false);
          onClose();
        }}
        panelPaddingSize="none"
        offset={4}
        anchorPosition={anchorPosition}
      >
        <EuiContextMenu initialPanelId={0} panels={getPanels(series as XYChartSeriesIdentifier[])} />
      </EuiPopover>
    );
  };
