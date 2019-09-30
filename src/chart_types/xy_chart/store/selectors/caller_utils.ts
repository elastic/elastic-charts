import { TooltipAndHighlightedGeoms } from './get_tooltip_values_highlighted_geoms';
import { SettingsSpec } from '../../../../specs';

export function isSettingsSpec(value: TooltipAndHighlightedGeoms | SettingsSpec): value is SettingsSpec {
  return (value as SettingsSpec).specType === 'settings';
}
export type EqualityCheck<A> = (prevVal: A, curVal: A) => boolean;
export function equalityCheck<A, B>(
  isA: (val: A | B) => val is A,
  eqCheckA: EqualityCheck<A>,
  eqCheckB: EqualityCheck<B>,
): (prev: A | B, curr: A | B) => boolean {
  return (prev: A | B, curr: A | B) => {
    if (isA(prev) && isA(curr)) {
      return eqCheckA(prev, curr);
    }
    if (!isA(prev) && !isA(curr)) {
      return eqCheckB(prev, curr);
    }
    return false;
  };
}
