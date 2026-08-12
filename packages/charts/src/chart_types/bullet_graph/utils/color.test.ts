/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ColorTick } from './color';
import { checkBarContrast } from './color';
import { Colors } from '../../../common/colors';

const band = (color: string): ColorTick => ({
  color,
  start: 0,
  end: 1,
  size: 1,
});

describe('Bullet color utils', () => {
  describe('#checkBarContrast', () => {
    it('should return true when the bar contrasts with every band', () => {
      const bar = Colors.Black.keyword;
      const bands = [band('#ddd'), band('#9BBEC8'), band(Colors.White.keyword)];

      expect(checkBarContrast(bands, bar)).toBe(true);
    });

    it('should return false when any band fails the contrast threshold', () => {
      const bar = Colors.Black.keyword;
      // #646464 passes APCA > 20 with black; #555555 does not
      const bands = [band('#646464'), band('#555555')];

      expect(checkBarContrast(bands, bar)).toBe(false);
    });
  });
});
