/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withTextMeasure } from './canvas_text_bbox_calculator';

describe.skip('CanvasTextBBoxCalculator', () => {
  test('can create a canvas for computing text measurement values', () =>
    withTextMeasure((textMeasure) => {
      const bbox = textMeasure(
        'foo',
        { fontStyle: 'normal', fontWeight: 'normal', fontFamily: 'Arial', fontVariant: 'normal' },
        16,
      );
      const expected = process.env.CI ? 4 : 2;
      // the string width is: 22.242 (chrome 96, safari 15.1), 22.233 (firefox 95), 21.15625 on node-canvas
      expect(Math.abs(bbox.width - 22)).toBeLessThanOrEqual(expected);
      expect(bbox.height).toBe(16);
    }));
});
