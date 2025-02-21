/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

/** @public */
export const GoalSubtype = Object.freeze({
  Goal: 'goal' as const,
  HorizontalBullet: 'horizontalBullet' as const,
  VerticalBullet: 'verticalBullet' as const,
});
/** @public */
export type GoalSubtype = $Values<typeof GoalSubtype>;
