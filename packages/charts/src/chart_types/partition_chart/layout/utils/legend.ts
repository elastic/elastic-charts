/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CategoryKey } from '../../../../common/category';
import { map } from '../../../../common/iterables';
import { LegendItem } from '../../../../common/legend';
import { LegendPositionConfig, SettingsSpec } from '../../../../specs/settings';
import { isHierarchicalLegend } from '../../../../utils/legend';
import { Layer } from '../../specs';
import { PartitionLayout } from '../types/config_types';
import { QuadViewModel } from '../types/viewmodel_types';

function makeKey(...keyParts: CategoryKey[]): string {
  return keyParts.join('---');
}

function compareTreePaths(
  { index: oiA, innerIndex: iiA, path: a }: QuadViewModel,
  { index: oiB, innerIndex: iiB, path: b }: QuadViewModel,
): number {
  if (oiA !== oiB) return oiA - oiB;
  if (iiA !== iiB) return iiA - iiB;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const diff = a[i].index - b[i].index;
    if (diff) {
      return diff;
    }
  }
  return a.length - b.length; // if one path is fully contained in the other, then parent (shorter) goes first
}

function createPartitionIdentifier(id: string, item: QuadViewModel) {
  return { specId: id, key: item.dataName, smAccessorValue: item.smAccessorValue };
}

/** @internal */
export function getLegendItems(
  id: string,
  layers: Layer[],
  flatLegend: boolean | undefined,
  legendMaxDepth: number,
  legendPosition: LegendPositionConfig,
  quadViewModel: QuadViewModel[],
  partitionLayout: PartitionLayout | undefined,
  settingsSpec: SettingsSpec,
): LegendItem[] {
  const uniqueNames = new Set(map(quadViewModel, ({ dataName, fillColor }) => makeKey(dataName, fillColor)));
  const useHierarchicalLegend = isHierarchicalLegend(flatLegend, legendPosition);
  const sortingFn = flatLegend && settingsSpec.legendSort;

  const customSortingFn = sortingFn
    ? (aItem: QuadViewModel, bItem: QuadViewModel) =>
        sortingFn(createPartitionIdentifier(id, aItem), createPartitionIdentifier(id, bItem))
    : null;

  const formattedLabel = ({ dataName, depth }: QuadViewModel) => {
    const formatter = layers[depth - 1]?.nodeLabel;
    return formatter ? formatter(dataName) : dataName;
  };

  function compareNames(aItem: QuadViewModel, bItem: QuadViewModel): number {
    const a = formattedLabel(aItem);
    const b = formattedLabel(bItem);
    return a < b ? -1 : a > b ? 1 : 0;
  }

  function descendingValues(aItem: QuadViewModel, bItem: QuadViewModel): number {
    return aItem.depth - bItem.depth || bItem.value - aItem.value;
  }

  const excluded: Set<string> = new Set();
  const items = quadViewModel.filter(({ depth, dataName, fillColor }) => {
    if (legendMaxDepth !== null && depth > legendMaxDepth) {
      return false;
    }
    if (!useHierarchicalLegend) {
      const key = makeKey(dataName, fillColor);
      if (uniqueNames.has(key) && excluded.has(key)) {
        return false;
      }
      excluded.add(key);
    }
    return true;
  });

  const waffleSortingFn = customSortingFn ?? descendingValues;
  const flatLegendSortingFn = customSortingFn ?? compareNames;

  items.sort(
    partitionLayout === PartitionLayout.waffle // waffle has inherent top to bottom descending order
      ? waffleSortingFn
      : flatLegend
      ? flatLegendSortingFn
      : compareTreePaths,
  );

  return items.map<LegendItem>((item) => {
    const { dataName, fillColor, depth, path } = item;
    return {
      color: fillColor,
      label: formattedLabel(item),
      childId: dataName,
      depth: useHierarchicalLegend ? depth - 1 : 0,
      path,
      seriesIdentifiers: [{ key: dataName, specId: id }],
      keys: [],
    };
  });
}
