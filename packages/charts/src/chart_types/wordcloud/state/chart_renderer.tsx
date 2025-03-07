/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { ChartRenderer } from '../../../state/internal_chart_renderer';
import { Wordcloud } from '../renderer/svg/connected_component';

/** @internal */
export const chartRenderer: ChartRenderer = () => <Wordcloud />;
