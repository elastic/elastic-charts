/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { withTextMeasure } from './canvas_text_bbox_calculator';

describe('CanvasTextBBoxCalculator', () => {
  test('can create a canvas for computing text measurement values', () =>
    withTextMeasure((textMeasure) => {
      const bbox = textMeasure('foo', 0);
      expect(Math.abs(bbox.width - 23.2)).toBeLessThanOrEqual(2);
      expect(bbox.height).toBe(16);
    }));
});
