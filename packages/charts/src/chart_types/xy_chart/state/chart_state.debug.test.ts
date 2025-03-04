/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getDebugStateSelector } from './selectors/get_debug_state';
import { MockSeriesSpec, MockGlobalSpec } from '../../../mocks/specs';
import { MockStore } from '../../../mocks/store/store';
import { ScaleType } from '../../../scales/constants';
import type { Rotation } from '../../../utils/common';

describe('XYChart - debug state', () => {
  it.each<Rotation>([0, 90, -90, 180])('line chart rotation: %i', (rotation) => {
    const store = MockStore.default({ width: 200, height: 200, top: 0, left: 0 });
    MockStore.addSpecs(
      [
        MockGlobalSpec.settings({ rotation, debugState: true }),
        MockSeriesSpec.line({
          xAccessor: 0,
          yAccessors: [1],
          data: [
            [0, 0],
            [4, 3],
            [10, 10],
          ],
          xScaleType: ScaleType.Linear,
          yScaleType: ScaleType.Linear,
        }),
        MockGlobalSpec.xAxis(
          {
            integersOnly: true,
          },
          rotation,
        ),
        MockGlobalSpec.yAxis(
          {
            integersOnly: true,
          },
          rotation,
        ),
      ],
      store,
    );
    const debugState = getDebugStateSelector(store.getState());
    expect(debugState).toMatchSnapshot();
  });
});
