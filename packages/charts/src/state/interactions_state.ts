/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { DOMElement } from './actions/dom_element';
import type { LegendPath } from './actions/legend';
import type { PointerStates } from './pointer_states';
import type { CategoryKey } from '../common/category';
import type { SeriesIdentifier } from '../common/series_id';
import type { TooltipValue } from '../specs';

/** @internal */
export interface TooltipInteractionState {
  pinned: boolean;
  selected: TooltipValue[];
}

/** @internal */
export interface InteractionsState {
  pointer: PointerStates;
  highlightedLegendPath: LegendPath;
  deselectedDataSeries: SeriesIdentifier[];
  hoveredDOMElement: DOMElement | null;
  drilldown: CategoryKey[];
  prevDrilldown: CategoryKey[];
  tooltip: TooltipInteractionState;
}
