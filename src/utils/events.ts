import { PointerOverEvent } from '../specs';
import { Scale } from './scales/scales';

export function isValidPointerOverEvent(event: PointerOverEvent, mainScale: Scale): boolean {
  return event.unit === undefined || event.unit === mainScale.unit;
}
