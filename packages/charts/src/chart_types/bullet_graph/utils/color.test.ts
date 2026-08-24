/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { scaleLinear } from 'd3-scale';

import type { ColorTick } from './color';
import { needBorder } from './color';
import { Colors } from '../../../common/colors';
import type { BulletPanelDimensions } from '../selectors/get_panel_dimensions';

/**
 * Identity scale over the `[0, 100]` domain, so band bounds can be expressed in domain values.
 */
const band = (color: string, start = 0, end = 100): ColorTick => ({
  color,
  start,
  end,
  size: Math.abs(end - start),
});

const bullet = (value: number, target?: number): BulletPanelDimensions =>
  ({
    datum: { value, target },
    scale: scaleLinear().domain([0, 100]).range([0, 100]),
  }) as unknown as BulletPanelDimensions;

describe('Bullet color utils', () => {
  describe('#needBorder', () => {
    const bar = Colors.Black.keyword;

    it('should not require any border when the bar contrasts with every band', () => {
      const bands = [band('#DDDDDD', 0, 50), band('#9BBEC8', 50, 80), band(Colors.White.keyword, 80, 100)];

      expect(needBorder(bands, bar, bullet(60, 90))).toEqual({ bar: false, target: false });
    });

    it('should require a bar border when any band fails the bar contrast threshold', () => {
      const bands = [band('#777777', 0, 50), band('#555555', 50, 100)];

      expect(needBorder(bands, bar, bullet(20)).bar).toBe(true);
    });

    it('should not require a target border when there is no target', () => {
      const bands = [band('#555555')];

      expect(needBorder(bands, bar, bullet(20))).toEqual({ bar: true, target: false });
    });

    it('should require a target border when the target band fails the stricter target threshold', () => {
      const bands = [band('#777777')];

      expect(needBorder(bands, bar, bullet(20, 90))).toEqual({ bar: false, target: true });
    });

    it('should require a target border when the target sits over a bar that is already bordered', () => {
      const bands = [band('#555555', 0, 50), band(Colors.White.keyword, 50, 100)];

      expect(needBorder(bands, bar, bullet(95, 90))).toEqual({ bar: true, target: true });
    });
  });
});
