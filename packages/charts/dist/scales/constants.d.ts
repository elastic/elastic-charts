import { $Values } from 'utility-types';
/**
 * The scale type
 * @public
 */
export declare const ScaleType: Readonly<{
    /**
     * Treated as linear scale with ticks in base 2
     */
    LinearBinary: "linear_binary";
    Linear: "linear";
    Ordinal: "ordinal";
    Log: "log";
    Sqrt: "sqrt";
    Time: "time";
    Quantize: "quantize";
    Quantile: "quantile";
    Threshold: "threshold";
}>;
/**
 * The scale type
 * @public
 */
export type ScaleType = $Values<typeof ScaleType>;
//# sourceMappingURL=constants.d.ts.map