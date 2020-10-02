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

import { Color } from '../../../../utils/commons';
import { Pixels, SizeRatio } from '../../../partition_chart/layout/types/geometry_types';
import { Font, FontFamily, TextAlign, TextBaseline } from '../../../partition_chart/layout/types/types';
import { Cell } from './viewmodel_types';

export interface Config {
  width: Pixels;
  height: Pixels;
  margin: { left: SizeRatio; right: SizeRatio; top: SizeRatio; bottom: SizeRatio };
  maxRowHeight: Pixels;
  maxColumnWidth: Pixels;
  // general text config
  fontFamily: FontFamily;

  timeZone: string;

  onBrushEnd?: (brushArea: HeatmapBrushEvent) => void;

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
    fontSize: Pixels;
    fill: string;
    align: TextAlign;
    baseline: TextBaseline;
    visible: boolean;
    padding: number;
    formatter: (value: string | number) => string;
  };
  yAxisLabel: Font & {
    fontSize: Pixels;
    width: Pixels | 'auto' | { max: Pixels };
    fill: string;
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
      fontSize: Pixels;
      maxWidth: Pixels | 'fill';
      fill: string;
      align: TextAlign;
      baseline: TextBaseline;
      visible: boolean;
    };
    border: {
      strokeWidth: Pixels;
      stroke: Color;
    };
  };
}

export type HeatmapBrushEvent = {
  cells: Cell[];
  x: (string | number)[];
  y: (string | number)[];
};
