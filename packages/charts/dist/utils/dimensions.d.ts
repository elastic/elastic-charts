import { Pixels } from '../common/geometry';
/** @public */
export interface Dimensions {
    top: number;
    left: number;
    width: number;
    height: number;
}
/**
 * fixme consider switching from `number` to `Pixels` or similar, once nominal typing is added
 * @public
 */
export interface PerSideDistance {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
/**
 * fixme consider deactivating \@typescript-eslint/no-empty-interface
 * see https://github.com/elastic/elastic-charts/pull/660#discussion_r419474171
 * @public
 */
export type Margins = PerSideDistance;
/**
 * todo separate type with partition padding type that allows number
 * @public
 */
export type Padding = PerSideDistance;
/**
 * Simple padding declaration
 * @public
 */
export interface SimplePadding {
    outer: Pixels;
    inner: Pixels;
}
//# sourceMappingURL=dimensions.d.ts.map