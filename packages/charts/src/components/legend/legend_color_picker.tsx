/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { Color as ItemColor } from './color';
import type { LegendItemProps } from './legend_item';
import type { Color } from '../../common/colors';

/** @internal */
export const useLegendColorPicker = ({
  item: { color, isSeriesHidden, label, pointStyle, seriesIdentifiers },
  colorPicker: ColorPickerRenderer,
  clearTemporaryColorsAction,
  setTemporaryColorAction,
  setPersistedColorAction,
}: LegendItemProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const colorRef = React.useRef<HTMLButtonElement>(null);

  const shouldClearPersistedColor = React.useRef(false);
  const toggleIsOpen = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const handleColorClick = (changeable: boolean) =>
    changeable
      ? (event: React.MouseEvent) => {
          event.stopPropagation();
          toggleIsOpen();
        }
      : undefined;

  const handleColorPickerClose = () => {
    const seriesKeys = seriesIdentifiers.map(({ key }) => key);
    setPersistedColorAction({ keys: seriesKeys, color: shouldClearPersistedColor.current ? null : color });
    clearTemporaryColorsAction();
    requestAnimationFrame(() => colorRef.current?.focus());
    toggleIsOpen();
  };

  const handleColorPickerChange = (c: Color | null) => {
    const seriesKeys = seriesIdentifiers.map(({ key }) => key);
    shouldClearPersistedColor.current = c === null;
    setTemporaryColorAction({ keys: seriesKeys, color: c });
  };

  const hasColorPicker = Boolean(ColorPickerRenderer);

  const renderItemColor = () => (
    <ItemColor
      ref={colorRef}
      color={color}
      seriesName={label}
      isSeriesHidden={isSeriesHidden}
      hasColorPicker={hasColorPicker}
      onClick={handleColorClick(hasColorPicker)}
      pointStyle={pointStyle}
    />
  );

  const renderColorPickerPopup = () =>
    ColorPickerRenderer &&
    isOpen &&
    colorRef.current && (
      <ColorPickerRenderer
        anchor={colorRef.current}
        color={color}
        onClose={handleColorPickerClose}
        onChange={handleColorPickerChange}
        seriesIdentifiers={seriesIdentifiers}
      />
    );

  return { renderItemColor, renderColorPickerPopup };
};
