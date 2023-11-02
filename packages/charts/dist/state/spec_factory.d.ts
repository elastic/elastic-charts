import { OptionalKeys, RequiredKeys } from 'utility-types';
import { Spec as Spec } from '../specs';
/**
 * Resulting props for spec given overrides, defaults, optionals and required props
 * @public
 */
export type SFProps<S extends Spec, Overrides extends SFOverrideKeys<S>, Defaults extends SFDefaultKeys<S, Overrides>, Optionals extends SFOptionalKeys<S, Overrides, Defaults>, Requires extends SFRequiredKeys<S, Overrides, Defaults, Optionals>> = Pick<S, Optionals | Requires> & Partial<Pick<S, Defaults>>;
/** @public */
export interface BuildProps<S extends Spec, Overrides extends SFOverrideKeys<S>, Defaults extends SFDefaultKeys<S, Overrides>, Optionals extends SFOptionalKeys<S, Overrides, Defaults>, Requires extends SFRequiredKeys<S, Overrides, Defaults, Optionals>> {
    overrides: SFOverrides<S, Overrides>;
    defaults: SFDefaults<S, Overrides, Defaults>;
    /** @deprecated - ignore - used only as type do not use as value */
    optionals: Pick<S, Optionals>;
    /** @deprecated - ignore - used only as type do not use as value */
    requires: Pick<S, Requires>;
}
/** All specs __must__ provide these as overrides */
type RequiredSpecProps = keyof Pick<Spec, 'chartType' | 'specType'>;
type SFOverrideKeys<S extends Spec> = keyof S;
type SFDefaultKeys<S extends Spec, Overrides extends keyof S> = keyof Omit<S, Overrides>;
type SFOptionalKeys<S extends Spec, Overrides extends keyof S, Defaults extends keyof Omit<S, Overrides>> = OptionalKeys<Omit<S, Overrides | Defaults>>;
type SFRequiredKeys<S extends Spec, Overrides extends keyof S, Defaults extends keyof Omit<S, Overrides>, Optionals extends SFOptionalKeys<S, Overrides, Defaults>> = RequiredKeys<Omit<S, Overrides | Defaults | Optionals>>;
type SFOverrides<S extends Spec, Overrides extends keyof S> = Required<Pick<S, Overrides | RequiredSpecProps>>;
type SFDefaults<S extends Spec, Overrides extends SFOverrideKeys<S>, Defaults extends SFDefaultKeys<S, Overrides>> = Required<Pick<S, Defaults>>;
export {};
//# sourceMappingURL=spec_factory.d.ts.map