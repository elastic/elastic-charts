import { RecursivePartial } from '../common';
import { LineAnnotationStyle, PartialTheme, RectAnnotationStyle, Theme } from './theme';
/** @public */
export declare const DEFAULT_ANNOTATION_LINE_STYLE: LineAnnotationStyle;
/** @public */
export declare const DEFAULT_ANNOTATION_RECT_STYLE: RectAnnotationStyle;
/** @public */
export declare function mergeWithDefaultAnnotationLine(config?: RecursivePartial<LineAnnotationStyle>): LineAnnotationStyle;
/** @public */
export declare function mergeWithDefaultAnnotationRect(config?: RecursivePartial<RectAnnotationStyle>): RectAnnotationStyle;
/**
 * Merge theme or themes with a base theme
 *
 * priority is based on spatial order
 *
 * @param theme - primary partial theme
 * @param defaultTheme - base theme
 * @param auxiliaryThemes - additional themes to be merged
 *
 * @public
 * @deprecated - Please use `baseTheme` and `theme` on Settings instead
 */
export declare function mergeWithDefaultTheme(theme: PartialTheme, defaultTheme?: Theme, auxiliaryThemes?: PartialTheme[]): Theme;
//# sourceMappingURL=merge_utils.d.ts.map