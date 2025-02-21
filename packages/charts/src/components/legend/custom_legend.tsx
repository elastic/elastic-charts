/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import type { CustomLegendProps } from '../../specs';
import { CustomLegend as CustomLegendComponent } from '../../specs';
import type { GlobalChartState } from '../../state/chart_state';
import { getPointerValueSelector } from '../../state/selectors/get_pointer_value';

interface Props extends CustomLegendProps {
  component: CustomLegendComponent;
}

const CustomLegendComponent: React.FC<Props> = ({ component: Component, ...props }) => <Component {...props} />;

const mapStateToProps = (state: GlobalChartState) => ({
  pointerValue: getPointerValueSelector(state),
});

/** @internal */
export const CustomLegend = connect(mapStateToProps)(CustomLegendComponent);
