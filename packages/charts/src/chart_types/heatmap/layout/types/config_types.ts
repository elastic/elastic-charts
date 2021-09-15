/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Pixels, SizeRatio } from '../../../../common/geometry';
import { Font, FontFamily, TextAlign, TextBaseline } from '../../../../common/text_utils';
import { Color } from '../../../../utils/common';

/**
 * @public
 */
export interface Config {
  width: Pixels;
  height: Pixels;
  margin: { left: SizeRatio; right: SizeRatio; top: SizeRatio; bottom: SizeRatio };
  maxRowHeight: Pixels;
  maxColumnWidth: Pixels;
  // general text config
  fontFamily: FontFamily;
  timeZone: string;

  /**
   * Config of the mask over the area outside of the selected cells
   */
  brushMask: { visible: boolean; fill: Color };
  /**
   * Config of the mask over the selected cells
   */
  brushArea: { visible: boolean; fill: Color; stroke: Color; strokeWidth: number };
  /**
   * Config of the brushing tool
   */
  brushTool: {
    visible: boolean;
    // TODO add support for changing the brush tool color
    fill: Color;
  };

  xAxisLabel: Font & {
    name: string;
    fontSize: Pixels;
    width: Pixels | 'auto';
    align: TextAlign;
    baseline: TextBaseline;
    visible: boolean;
    padding: number;
    formatter: (value: string | number) => string;
  };
  yAxisLabel: Font & {
    name: string;
    fontSize: Pixels;
    width: Pixels | 'auto' | { max: Pixels };
    baseline: TextBaseline;
    visible: boolean;
    padding: number | { left?: number; right?: number; top?: number; bottom?: number };
    formatter: (value: string | number) => string;
  };
  grid: {
    cellWidth: {
      min: Pixels;
      max: Pixels | 'fill';
    };
    cellHeight: {
      min: Pixels;
      max: Pixels | 'fill';
    };
    stroke: {
      color: string;
      width: number;
    };
  };
  cell: {
    maxWidth: Pixels | 'fill';
    maxHeight: Pixels | 'fill';
    align: 'center';
    label: Font & {
      minFontSize: Pixels;
      maxFontSize: Pixels;
      useGlobalMinFontSize: boolean;
      maxWidth: Pixels | 'fill';
      visible: boolean;
    };
    border: {
      strokeWidth: Pixels;
      stroke: Color;
    };
  };
  maxLegendHeight?: number;
}
