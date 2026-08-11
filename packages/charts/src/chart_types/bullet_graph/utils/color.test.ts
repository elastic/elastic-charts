/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ColorTick } from './color';
import { getStrokeContrastColor } from './color';
import { Colors } from '../../../common/colors';

const band = (color: string): ColorTick => ({
  color,
  start: 0,
  end: 1,
  size: 1,
});

describe('Bullet color utils', () => {
  describe('#getStrokeContrastColor', () => {
    const background = Colors.White.keyword;

    it('should return the bar color when it contrasts with every band', () => {
      const bar = Colors.Black.keyword;
      const bands = [band('#ddd'), band('#9BBEC8'), band(Colors.White.keyword)];

      expect(getStrokeContrastColor(bands, bar, background)).toBe(bar);
    });

    it('should return the background color when any band fails the contrast threshold', () => {
      const bar = Colors.Black.keyword;
      // #468260 passes APCA > 30 with black; #0802A3 does not
      const bands = [band('#468260'), band('#0802A3')];

      expect(getStrokeContrastColor(bands, bar, background)).toBe(background);
    });
  });
});
