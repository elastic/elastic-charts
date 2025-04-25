/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import { getElementAtCursorPositionSelector } from './get_elements_at_cursor_pos';
import { MockGlobalSpec, MockSeriesSpec } from '../../../../mocks/specs/specs';
import { MockStore } from '../../../../mocks/store/store';
import { ScaleType } from '../../../../scales/constants';
import { onPointerMove } from '../../../../state/actions/mouse';
import type { GlobalChartState } from '../../../../state/chart_state';
import { noModifierKeysPressed } from '../../../../utils/keys';

const data = [
  { x: 0, y: 2 },
  { x: 0, y: 2.2 },
  { x: 1, y: 2 },
  { x: 2, y: 3 },
];

describe('getElementAtCursorPositionSelector', () => {
  let store: Store<GlobalChartState>;

  describe('Area', () => {
    beforeEach(() => {
      store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
      MockStore.addSpecs(
        [
          MockGlobalSpec.settingsNoMargins(),
          MockSeriesSpec.area({
            data,
            xScaleType: ScaleType.Ordinal,
          }),
        ],
        store,
      );
    });

    it('should correctly sort matched points near y = 2', () => {
      store.dispatch(onPointerMove({ position: { x: 0, y: 100 }, time: 0, keyPressed: noModifierKeysPressed }));
      const elements = getElementAtCursorPositionSelector(store.getState());
      expect(elements).toHaveLength(2);
      expect(elements.map(({ value }) => value.datum.y)).toEqual([2, 2.2]);
    });

    it('should correctly sort matched points near y = 2.2', () => {
      store.dispatch(onPointerMove({ position: { x: 0, y: 80 }, time: 0, keyPressed: noModifierKeysPressed }));
      const elements = getElementAtCursorPositionSelector(store.getState());
      expect(elements).toHaveLength(2);
      expect(elements.map(({ value }) => value.datum.y)).toEqual([2.2, 2]);
    });
  });

  describe('Bubble', () => {
    beforeEach(() => {
      store = MockStore.default({ width: 300, height: 300, top: 0, left: 0 }, 'chartId');
      MockStore.addSpecs(
        [
          MockGlobalSpec.settingsNoMargins(),
          MockSeriesSpec.bubble({
            data,
            xScaleType: ScaleType.Ordinal,
          }),
        ],
        store,
      );
    });

    it('should correctly sort matched points near y = 2', () => {
      store.dispatch(onPointerMove({ position: { x: 0, y: 100 }, time: 0, keyPressed: noModifierKeysPressed }));
      const elements = getElementAtCursorPositionSelector(store.getState());
      expect(elements).toHaveLength(3);
      expect(elements.map(({ value }) => value.datum.y)).toEqual([2, 2.2, 2]);
    });

    it('should correctly sort matched points near y = 2.2', () => {
      store.dispatch(onPointerMove({ position: { x: 0, y: 80 }, time: 0, keyPressed: noModifierKeysPressed }));
      const elements = getElementAtCursorPositionSelector(store.getState());
      expect(elements).toHaveLength(4);
      expect(elements.map(({ value }) => value.datum.y)).toEqual([2.2, 2, 2, 3]);
    });
  });
});
