/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { LegendValue, shouldDisplayGridList, shouldDisplayTable } from './legend';
import type { LegendPositionConfig } from '../specs';
import type { Layout, Position } from '../utils/common';
import { LayoutDirection } from '../utils/common';

type LayoutResult = 'table' | 'gridList' | 'list';

function getLayoutResult(
  legendValues: LegendValue[],
  legendPosition: Position | LegendPositionConfig,
  legendLayout?: Layout,
): LayoutResult {
  const isTableView = shouldDisplayTable(legendValues, legendPosition, legendLayout);
  const isGridListView = shouldDisplayGridList(isTableView, legendPosition, legendLayout);
  if (isTableView) return 'table';
  if (isGridListView) return 'gridList';
  return 'list';
}

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
  it('returns true when legendLayout is "table"', () => {
    expect(shouldDisplayTable(simpleValues, 'bottom', 'table')).toBe(true);
    expect(shouldDisplayTable(tableValues, 'left', 'table')).toBe(true);
  });

  it('returns false when legendLayout is "list" and position is top', () => {
    expect(shouldDisplayTable(simpleValues, 'bottom', 'list')).toBe(false);
    expect(shouldDisplayTable(tableValues, 'top', 'list')).toBe(false);
  });

  describe('default layout (legendLayout undefined)', () => {
    it('returns true when legendValues require a table', () => {
      expect(shouldDisplayTable(tableValues, 'bottom')).toBe(true);
      expect(shouldDisplayTable(tableValues, 'right')).toBe(true);
    });

    it('returns false when legendValues are simple', () => {
      expect(shouldDisplayTable(simpleValues, 'bottom')).toBe(false);
      expect(shouldDisplayTable([LegendValue.Value], 'left')).toBe(false);
    });
  });

  describe('vertical positions always use default layout logic', () => {
    it('falls back to default layout for left/right even with legendLayout "list"', () => {
      expect(shouldDisplayTable(tableValues, 'left', 'list')).toBe(true);
      expect(shouldDisplayTable(tableValues, 'right', 'list')).toBe(true);
    });

    it('falls back to default layout for vertical LegendPositionConfig', () => {
      expect(shouldDisplayTable(tableValues, verticalPositionConfig, 'list')).toBe(true);
    });
  });
});

describe('shouldDisplayGridList', () => {
  it('returns false when isTableView is true', () => {
    expect(shouldDisplayGridList(true, 'bottom')).toBe(false);
    expect(shouldDisplayGridList(true, 'left', 'list')).toBe(false);
  });

  it('returns true for default layout (legendLayout undefined)', () => {
    expect(shouldDisplayGridList(false, 'bottom')).toBe(true);
    expect(shouldDisplayGridList(false, 'right')).toBe(true);
  });

  it('returns true for vertical positions regardless of legendLayout', () => {
    expect(shouldDisplayGridList(false, 'left', 'list')).toBe(true);
    expect(shouldDisplayGridList(false, 'right', 'list')).toBe(true);
    expect(shouldDisplayGridList(false, verticalPositionConfig, 'list')).toBe(true);
  });

  it('returns false for horizontal position with legendLayout "list"', () => {
    expect(shouldDisplayGridList(false, 'bottom', 'list')).toBe(false);
    expect(shouldDisplayGridList(false, 'top', 'list')).toBe(false);
    expect(shouldDisplayGridList(false, horizontalPositionConfig, 'list')).toBe(false);
  });
});

describe('combined layout selection', () => {
  describe('default layout (legendLayout undefined) — backward compatible', () => {
    it('selects table for complex legendValues at any position', () => {
      expect(getLayoutResult(tableValues, 'bottom')).toBe('table');
      expect(getLayoutResult(tableValues, 'right')).toBe('table');
      expect(getLayoutResult(tableValues, 'top')).toBe('table');
      expect(getLayoutResult(tableValues, 'left')).toBe('table');
    });

    it('selects gridList for simple legendValues at any position', () => {
      expect(getLayoutResult(simpleValues, 'bottom')).toBe('gridList');
      expect(getLayoutResult(simpleValues, 'right')).toBe('gridList');
      expect(getLayoutResult(simpleValues, 'top')).toBe('gridList');
      expect(getLayoutResult(simpleValues, 'left')).toBe('gridList');
    });
  });

  describe('explicit legendLayout "table"', () => {
    it('selects table regardless of position or values', () => {
      expect(getLayoutResult(simpleValues, 'bottom', 'table')).toBe('table');
      expect(getLayoutResult(simpleValues, 'right', 'table')).toBe('table');
      expect(getLayoutResult(tableValues, 'top', 'table')).toBe('table');
      expect(getLayoutResult(tableValues, 'left', 'table')).toBe('table');
    });
  });

  describe('explicit legendLayout "list"', () => {
    it('selects list for horizontal positions', () => {
      expect(getLayoutResult(simpleValues, 'bottom', 'list')).toBe('list');
      expect(getLayoutResult(simpleValues, 'top', 'list')).toBe('list');
      expect(getLayoutResult(simpleValues, horizontalPositionConfig, 'list')).toBe('list');
    });

    it('selects gridList for vertical positions (default layout takes precedence)', () => {
      expect(getLayoutResult(simpleValues, 'left', 'list')).toBe('gridList');
      expect(getLayoutResult(simpleValues, 'right', 'list')).toBe('gridList');
      expect(getLayoutResult(simpleValues, verticalPositionConfig, 'list')).toBe('gridList');
    });

    it('selects table for vertical positions with complex values (default layout takes precedence)', () => {
      expect(getLayoutResult(tableValues, 'left', 'list')).toBe('table');
      expect(getLayoutResult(tableValues, 'right', 'list')).toBe('table');
      expect(getLayoutResult(tableValues, verticalPositionConfig, 'list')).toBe('table');
    });
  });

  describe('LegendPositionConfig', () => {
    it('uses direction to determine horizontal vs vertical', () => {
      expect(getLayoutResult(simpleValues, horizontalPositionConfig, 'list')).toBe('list');
      expect(getLayoutResult(simpleValues, verticalPositionConfig, 'list')).toBe('gridList');
    });
  });
});
