/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { PopoverAnchorPosition } from '@elastic/eui';
import { EuiButton, EuiButtonEmpty, EuiColorPicker, EuiFlexItem, EuiSpacer, EuiWrappingPopover } from '@elastic/eui';
import type { FC } from 'react';
import React from 'react';

import type { LegendColorPickerProps } from '@elastic/charts';

export const getColorPicker =
  (anchorPosition: PopoverAnchorPosition = 'leftCenter'): FC<LegendColorPickerProps> =>
  ({ anchor, color, onClose, onChange }) => (
    <EuiWrappingPopover
      isOpen
      button={anchor}
      closePopover={onClose}
      panelStyle={{ padding: 16 }}
      anchorPosition={anchorPosition}
      className="echColorPickerPopover"
      ownFocus
    >
      <EuiColorPicker display="inline" color={color} onChange={onChange} />
      <EuiSpacer size="m" />
      <EuiFlexItem grow={false}>
        <EuiButtonEmpty
          color="danger"
          style={{ color: '#ab231c' }}
          size="s"
          onClick={() => {
            onChange(null);
            anchor.focus();
            onClose();
          }}
          title="Clear color selection"
        >
          Clear color
        </EuiButtonEmpty>
      </EuiFlexItem>
      <EuiButton
        fullWidth
        size="s"
        iconType="check"
        title="Confirm color selection"
        onClick={onClose}
        style={{ color: '#0061a6', backgroundColor: '#cce4f5', borderRadius: 4 }}
      >
        Done
      </EuiButton>
    </EuiWrappingPopover>
  );
