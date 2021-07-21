/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PointerEvent } from '../../specs/settings';

/** @internal */
export const EXTERNAL_POINTER_EVENT = 'EXTERNAL_POINTER_EVENT';

interface ExternalPointerEvent {
  type: typeof EXTERNAL_POINTER_EVENT;
  event: PointerEvent;
}

/** @internal */
export function onExternalPointerEvent(event: PointerEvent): ExternalPointerEvent {
  return { type: EXTERNAL_POINTER_EVENT, event };
}

/** @internal */
export type EventsActions = ExternalPointerEvent;
