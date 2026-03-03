/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendValue, shouldDisplayGridList, shouldDisplayTable } from './legend';
import type { LegendPositionConfig } from '../specs';
import { Position, LegendLayout } from '../utils/common';
import { LayoutDirection } from '../utils/common';

const simpleValues: LegendValue[] = [LegendValue.CurrentAndLastValue];
const tableValues: LegendValue[] = [LegendValue.Median, LegendValue.Min];
const verticalPositionConfig: LegendPositionConfig = {
  direction: LayoutDirection.Vertical,
  vAlign: 'top',
  hAlign: 'right',
  floating: false,
};
const horizontalPositionConfig: LegendPositionConfig = {
  direction: LayoutDirection.Horizontal,
  vAlign: 'bottom',
  hAlign: 'left',
  floating: false,
};

describe('shouldDisplayTable', () => {
  it.each([
    // Explicit legendLayout cases
    { values: simpleValues, position: Position.Bottom, legendLayout: LegendLayout.Table, expected: true },
    { values: tableValues, position: Position.Left, legendLayout: LegendLayout.Table, expected: true },
    { values: simpleValues, position: Position.Bottom, legendLayout: LegendLayout.List, expected: false },
    { values: tableValues, position: Position.Top, legendLayout: LegendLayout.List, expected: false },

    // Default layout (legendLayout undefined)
    { values: tableValues, position: Position.Bottom, legendLayout: undefined, expected: true },
    { values: tableValues, position: Position.Right, legendLayout: undefined, expected: true },
    { values: simpleValues, position: Position.Bottom, legendLayout: undefined, expected: false },
    { values: [LegendValue.Value], position: Position.Left, legendLayout: undefined, expected: false },

    // Vertical positions fallback to the default layout logic
    { values: tableValues, position: Position.Left, legendLayout: LegendLayout.List, expected: true },
    { values: tableValues, position: Position.Right, legendLayout: LegendLayout.List, expected: true },
    { values: tableValues, position: verticalPositionConfig, legendLayout: LegendLayout.List, expected: true },
  ])(
    'returns $expected when legendLayout="$legendLayout" and position="$position"',
    ({ values, position, legendLayout, expected }) => {
      expect(shouldDisplayTable(values, position, legendLayout)).toBe(expected);
    },
  );
});

describe('shouldDisplayGridList', () => {
  it.each([
    // isTableView = true → always false
    { isTableView: true, position: Position.Bottom, legendLayout: undefined, expected: false },
    { isTableView: true, position: Position.Left, legendLayout: LegendLayout.List, expected: false },

    // Default layout (legendLayout undefined) -> always gridList: true
    { isTableView: false, position: Position.Bottom, legendLayout: undefined, expected: true },
    { isTableView: false, position: Position.Right, legendLayout: undefined, expected: true },

    // Vertical positions → always true (unless isTableView true which is covered above)
    { isTableView: false, position: Position.Left, legendLayout: LegendLayout.List, expected: true },
    { isTableView: false, position: Position.Right, legendLayout: LegendLayout.List, expected: true },
    { isTableView: false, position: verticalPositionConfig, legendLayout: LegendLayout.List, expected: true },

    // Horizontal positions + legendLayout "list" → false
    { isTableView: false, position: Position.Bottom, legendLayout: LegendLayout.List, expected: false },
    { isTableView: false, position: Position.Top, legendLayout: LegendLayout.List, expected: false },
    { isTableView: false, position: horizontalPositionConfig, legendLayout: LegendLayout.List, expected: false },
  ])(
    'returns $expected when isTableView=$isTableView, legendLayout="$legendLayout", position="$position"',
    ({ isTableView, position, legendLayout, expected }) => {
      expect(shouldDisplayGridList(isTableView, position, legendLayout)).toBe(expected);
    },
  );
});
