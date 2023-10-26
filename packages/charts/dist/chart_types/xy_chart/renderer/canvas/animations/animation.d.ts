import { $Keys } from 'utility-types';
import { TimeFunction } from './../../../../../utils/time_functions';
import { TimeMs } from '../../../../../common/geometry';
/**
 * TODO add logic for other types like colors
 * @public
 */
export type AnimatedValue = number;
/**
 * Shared animation speeds in ms
 * @public
 */
export declare const AnimationSpeed: Readonly<{
    extraFast: 90;
    fast: 150;
    normal: 250;
    slow: 350;
    extraSlow: 500;
}>;
/** @public */
export type AnimationSpeed = $Keys<typeof AnimationSpeed>;
/** @public */
export interface AnimationOptions {
    /**
     * Enables animations on annotations
     */
    enabled?: boolean;
    /**
     * Set initial value for initial render animations.
     * By default, the initial value is determined on the initial render
     * then animates any change thereafter.
     *
     * @example
     * ```ts
     * // Initially animates the height from 0 to 100 with no value change
     * atx.getValue('bar-height', 100, { initialValue: 0 })
     * ```
     */
    initialValue?: AnimatedValue;
    /**
     * start delay in ms
     */
    delay?: TimeMs | AnimationSpeed;
    /**
     * Snaps back to initial value instantly
     */
    snapValues?: AnimatedValue[];
    /**
     * The speed curve of the animation
     */
    timeFunction?: TimeFunction;
    /**
     * Duration from start of animation to completion in ms
     */
    duration?: TimeMs | AnimationSpeed;
}
//# sourceMappingURL=animation.d.ts.map