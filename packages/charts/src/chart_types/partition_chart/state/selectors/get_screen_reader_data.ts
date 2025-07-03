/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getChartTypeDescriptionSelector } from './get_chart_type_description';
import { partitionMultiGeometries } from './geometries';
import { getPartitionSpecs } from './get_partition_specs';
import type { ChartSpecificScreenReaderData } from '../../../../state/chart_selectors';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import type { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { STATISTICS_KEY } from '../../layout/utils/group_by_rollup';
import type { PartitionSpec } from '../../specs';

/** @internal */
export interface PartitionSectionData {
  panelTitle?: string;
  label: string;
  parentName: string | undefined;
  depth: number;
  percentage: string;
  value: number;
  valueText: string;
}

/** @internal */
export interface PartitionData {
  hasMultipleLayers: boolean;
  isSmallMultiple: boolean;
  data: PartitionSectionData[];
}

/**
 * @internal
 */
const getScreenReaderDataForPartitions = (
  [spec]: PartitionSpec[],
  shapeViewModels: ShapeViewModel[],
): PartitionSectionData[] => {
  return shapeViewModels.flatMap(({ quadViewModel, layers, panel }) =>
    quadViewModel.map(({ depth, value, dataName, parent, path }) => {
      const label = layers[depth - 1]?.nodeLabel?.(dataName) ?? dataName;
      const parentValue = path.length > 1 ? path.at(-2)?.value : undefined;
      const parentName =
        depth > 1 && parentValue ? layers[depth - 2]?.nodeLabel?.(parentValue) ?? path.at(-1)?.value : 'none';

      return {
        panelTitle: panel.title,
        depth,
        label,
        parentName,
        percentage: `${Math.round((value / parent[STATISTICS_KEY].globalAggregate) * 100)}%`,
        value,
        valueText: spec?.valueFormatter ? spec.valueFormatter(value) : `${value}`,
      };
    }),
  );
};

/** @internal */
export const getPartitionScreenReaderDataSelector = createCustomCachedSelector(
  [getPartitionSpecs, partitionMultiGeometries],
  (specs, shapeViewModel): PartitionData => {
    if (specs.length === 0) {
      return {
        hasMultipleLayers: false,
        isSmallMultiple: false,
        data: [],
      };
    }
    return {
      hasMultipleLayers: (specs[0]?.layers.length ?? NaN) > 1,
      isSmallMultiple: shapeViewModel.length > 1,
      data: getScreenReaderDataForPartitions(specs, shapeViewModel),
    };
  },
);

/** @internal */
export const getScreenReaderDataSelector = createCustomCachedSelector(
  [getPartitionScreenReaderDataSelector, getChartTypeDescriptionSelector],
  (partitionData, chartTypeDescription): ChartSpecificScreenReaderData => {
    const summaryParts: string[] = [];

    // Add chart type description first
    if (chartTypeDescription) {
      summaryParts.push(chartTypeDescription);
    }

    // Add partition-specific accessibility information
    if (partitionData.data.length > 0) {
      const totalItems = partitionData.data.length;
      summaryParts.push(`${totalItems} data ${totalItems === 1 ? 'point' : 'points'}`);

      if (partitionData.hasMultipleLayers) {
        summaryParts.push('with hierarchical layers');
      }

      if (partitionData.isSmallMultiple) {
        summaryParts.push('in small multiples layout');
      }
    }

    return {
      data: partitionData,
      summaryParts,
    };
  },
);
