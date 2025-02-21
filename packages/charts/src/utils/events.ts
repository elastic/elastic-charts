/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ScaleBand, ScaleContinuous } from '../scales';
import type { BrushEndListener, PointerEvent, PointerOverEvent } from '../specs';
import { isPointerOverEvent } from '../specs';
import type { DragState } from '../state/pointer_states';

/** @internal */
export function isValidPointerOverEvent(
  mainScale: ScaleBand | ScaleContinuous,
  event: PointerEvent | null | undefined,
): event is PointerOverEvent {
  return isPointerOverEvent(event) && (event.unit === undefined || event.unit === mainScale.unit);
}

/** @internal */
export interface DragCheckProps {
  onBrushEnd: BrushEndListener | undefined;
  lastDrag: DragState | null;
}

/** @internal */
export function hasDragged(prevProps: DragCheckProps | null, nextProps: DragCheckProps | null) {
  if (nextProps === null) {
    return false;
  }
  if (!nextProps.onBrushEnd) {
    return false;
  }
  const prevLastDrag = prevProps !== null ? prevProps.lastDrag : null;
  const nextLastDrag = nextProps.lastDrag;
  return nextLastDrag !== null && (prevLastDrag === null || prevLastDrag.end.time !== nextLastDrag.end.time);
}
