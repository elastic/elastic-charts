import { Color } from './colors';
/**
 * todo consider doing tighter control for permissible font families, eg. as in Kibana Canvas - expression language
 *  - though the same applies for permissible (eg. known available or loaded) font weights, styles, variants...
 * @public
 */
export declare type FontFamily = string;
/** @public */
export declare const FONT_WEIGHTS: readonly (string | number)[];
/** @public */
export declare const FONT_VARIANTS: readonly ["normal", "small-caps"];
/** @public */
export declare type FontVariant = typeof FONT_VARIANTS[number];
/** @public */
export declare type FontWeight = typeof FONT_WEIGHTS[number];
/** @public */
export declare const FONT_STYLES: readonly ["normal", "italic", "oblique", "inherit", "initial", "unset"];
/** @public */
export declare type FontStyle = typeof FONT_STYLES[number];
/** @public */
export declare type PartialFont = Partial<Font>;
/** @public */
export declare const TEXT_ALIGNS: readonly ["start", "end", "left", "right", "center"];
/** @public */
export declare type TextAlign = typeof TEXT_ALIGNS[number];
/** @public */
export declare type TextBaseline = typeof TEXT_BASELINE[number];
/**
 * this doesn't include the font size, so it's more like a font face (?) - unfortunately all vague terms
 * @public
 */
export interface Font {
    fontStyle: FontStyle;
    fontVariant: FontVariant;
    fontWeight: FontWeight;
    fontFamily: FontFamily;
    textColor: Color;
}
/** @public */
export declare const TEXT_BASELINE: readonly ["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"];
//# sourceMappingURL=text_utils.d.ts.map