/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  EuiButton,
  EuiButtonIcon,
  EuiColorPicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiWrappingPopover,
  PopoverAnchorPosition,
} from '@elastic/eui';
import React from 'react';

import { LegendColorPicker } from '@elastic/charts';

export const getColorPicker = (anchorPosition: PopoverAnchorPosition = 'leftCenter'): LegendColorPicker => ({
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
            anchor.focus();
            onClose();
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  </EuiWrappingPopover>
);
