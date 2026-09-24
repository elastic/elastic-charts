/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { AngularBulletSubtypes } from './angular';
import { getAngularAspectFallback } from './angular';
import { BulletSubtype } from '../spec';

const angularSubtypes: AngularBulletSubtypes[] = [
  BulletSubtype.circle,
  BulletSubtype.halfCircle,
  BulletSubtype.twoThirdsCircle,
];

const height = 200;

describe('Bullet angular utils', () => {
  describe('#getAngularAspectFallback', () => {
    it.each(angularSubtypes)('should keep the arc while the graph area is close to square for %s', (subtype) => {
      expect(getAngularAspectFallback({ width: 200, height }, subtype)).toBeNull();
      expect(getAngularAspectFallback({ width: 600, height }, subtype)).toBeNull();
    });

    it.each(angularSubtypes)('should degrade to a horizontal bullet when too wide for %s', (subtype) => {
      expect(getAngularAspectFallback({ width: 2400, height }, subtype)).toBe(BulletSubtype.horizontal);
    });

    it.each(angularSubtypes)('should degrade to a vertical bullet when too tall for %s', (subtype) => {
      expect(getAngularAspectFallback({ width: 60, height }, subtype)).toBe(BulletSubtype.vertical);
    });
  });
});
