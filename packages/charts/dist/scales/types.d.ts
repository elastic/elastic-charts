/**
 * Options specific to log scales
 * @public
 */
export interface LogScaleOptions {
    /**
     * Min value to render on log scale
     *
     * Defaults to min value of domain, or LOG_MIN_ABS_DOMAIN if mixed polarity
     */
    logMinLimit?: number;
    /**
     * Base for log scale
     *
     * @defaultValue 10
     * (i.e. log base 10)
     */
    logBase?: number;
}
//# sourceMappingURL=types.d.ts.map