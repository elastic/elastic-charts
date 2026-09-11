/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { resolveHighlightedPaths } from './get_highlighted_paths';
import type { TooltipValue } from '../../specs';
import type { LegendPath } from '../actions/legend';

function tooltipItem(key: string, path?: LegendPath): TooltipValue {
  return {
    label: key,
    color: '#000',
    isHighlighted: false,
    isVisible: true,
    seriesIdentifier: { key, specId: key },
    value: 1,
    formattedValue: '1',
    path,
  };
}

const pathA: LegendPath = [{ index: 0, value: 'a' }];
const pathB: LegendPath = [{ index: 0, value: 'b' }];

describe('resolveHighlightedPaths', () => {
  it('returns empty when nothing is hovered or selected', () => {
    expect(resolveHighlightedPaths([], null)).toEqual([]);
  });

  it('uses selected tooltip item paths', () => {
    expect(resolveHighlightedPaths([tooltipItem('a', pathA), tooltipItem('b', pathB)], null)).toEqual([pathA, pathB]);
  });

  it('prefers legend hover over tooltip selection', () => {
    expect(resolveHighlightedPaths([tooltipItem('b', pathB)], pathA)).toEqual([pathA]);
  });

  it('preserves hierarchical partition paths', () => {
    const chinaMachineryPath: LegendPath = [
      { index: 0, value: 'machinery' },
      { index: 0, value: 'asia' },
      { index: 0, value: 'china' },
    ];
    expect(resolveHighlightedPaths([tooltipItem('china', chinaMachineryPath)], null)).toEqual([chinaMachineryPath]);
  });
});
