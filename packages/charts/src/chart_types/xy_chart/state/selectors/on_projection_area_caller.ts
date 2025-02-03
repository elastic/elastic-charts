/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Selector } from 'react-redux';

import { computeChartDimensionsSelector } from './compute_chart_dimensions';
import { ChartType } from '../../../chart_type';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { Dimensions } from '../../../../utils/dimensions';

function isDiff(prevProps: Dimensions, nextProps: Dimensions) {
  return (
    prevProps.top !== nextProps.top ||
    prevProps.left !== nextProps.left ||
    prevProps.width !== nextProps.width ||
    prevProps.height !== nextProps.height
  );
}

const getParentDimension = (state: GlobalChartState) => state.parentDimensions;

/**
 * @internal
 */
export function createOnProjectionAreaCaller(): (state: GlobalChartState) => void {
  let prevProps: { projection: Dimensions; parent: Dimensions } | null = null;
  let selector: Selector<GlobalChartState, void> | null = null;
  return (state: GlobalChartState) => {
    if (selector === null && state.chartType === ChartType.XYAxis) {
      selector = createCustomCachedSelector(
        [computeChartDimensionsSelector, getSettingsSpecSelector, getParentDimension],
        ({ chartDimensions }, { onProjectionAreaChange }, parent): void => {
          const nextProps = { projection: { ...chartDimensions }, parent: { ...parent } };
          const areDifferent =
            !prevProps ||
            isDiff(prevProps.projection, nextProps.projection) ||
            isDiff(nextProps.parent, nextProps.parent);
          if (onProjectionAreaChange && areDifferent) {
            onProjectionAreaChange(nextProps);
          }
          prevProps = nextProps;
        },
      );
    }
    if (selector) {
      selector(state);
    }
  };
}
