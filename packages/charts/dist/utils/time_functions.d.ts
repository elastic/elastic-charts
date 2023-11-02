import { $Values } from 'utility-types';
/** @public */
export declare const TimeFunction: Readonly<{
    /**
     * Animation with the same speed from start to end
     */
    linear: "linear";
    /**
     * Animation with a slow start, then fast, then end slowly (this is default)
     */
    ease: "ease";
    /**
     * Animation with a slow start
     */
    easeIn: "easeIn";
    /**
     * Animation with a slow end
     */
    easeOut: "easeOut";
    /**
     * Animation with a slow start and end
     */
    easeInOut: "easeInOut";
}>;
/** @public */
export type TimeFunction = $Values<typeof TimeFunction>;
//# sourceMappingURL=time_functions.d.ts.map