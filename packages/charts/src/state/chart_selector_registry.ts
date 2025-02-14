/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ChartSelectors, SelectorId, SelectorFn, DependencyMap } from './chart_selectors';
import { getIsInitializedSelector } from './selectors/get_is_initialized';

class ChartSelectorRegistry {
  private baseSelectors: Map<SelectorId, SelectorFn> = new Map();
  private chartTypeSelectors: Map<string, ChartSelectors> = new Map();
  private dependencies: DependencyMap = {};

  // Register base selector that will be available to all chart types
  registerBaseSelector<R>(id: SelectorId, implementation: SelectorFn<R>, dependencies: SelectorId[] = []): void {
    if (this.wouldCreateCircularDependency(id, dependencies)) {
      throw new Error(`Circular dependency detected for selector: ${id}`);
    }

    this.baseSelectors.set(id, implementation);
    this.dependencies[id] = new Set(dependencies);
  }

  // Register all selectors for a specific chart type
  registerChartTypeSelectors(chartType: string, selectors: ChartSelectors): void {
    this.chartTypeSelectors.set(chartType, selectors);
  }

  // Get a selector for a specific chart type
  getSelector<R>(chartType: string, id: SelectorId): SelectorFn<R> {
    // Get chart-type specific selectors
    const chartSelectors = this.chartTypeSelectors.get(chartType);
    if (!chartSelectors) {
      throw new Error(`No selectors registered for chart type: ${chartType}`);
    }

    // Check if the chart type has this specific selector
    if (chartSelectors[id]) {
      return chartSelectors[id];
    }

    // Fall back to base selector
    const baseSelector = this.baseSelectors.get(id);
    if (!baseSelector) {
      throw new Error(`Selector not found: ${id}`);
    }

    return baseSelector as SelectorFn<R>;
  }

  private wouldCreateCircularDependency(id: SelectorId, newDeps: SelectorId[]): boolean {
    const visited = new Set<SelectorId>();

    const checkCycle = (currentId: SelectorId): boolean => {
      if (visited.has(currentId)) {
        return true;
      }

      visited.add(currentId);
      const deps = this.dependencies[currentId] || new Set();

      for (const dep of deps) {
        if (checkCycle(dep)) {
          return true;
        }
      }

      visited.delete(currentId);
      return false;
    };

    const originalDeps = this.dependencies[id];
    this.dependencies[id] = new Set(newDeps);

    const hasCircular = checkCycle(id);

    if (originalDeps) {
      this.dependencies[id] = originalDeps;
    } else {
      delete this.dependencies[id];
    }

    return hasCircular;
  }
}

/**
 * Initialize registry
 * @internal
 */
export const chartSelectorRegistry = new ChartSelectorRegistry();

// Register base selectors
chartSelectorRegistry.registerBaseSelector<ReturnType<typeof getIsInitializedSelector>>(
  'getIsInitialized',
  getIsInitializedSelector,
);
