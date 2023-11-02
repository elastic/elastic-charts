import { LineAnnotationStyle, RectAnnotationStyle } from './theme';
import { RecursivePartial } from '../common';
/** @public */
export declare const DEFAULT_ANNOTATION_LINE_STYLE: LineAnnotationStyle;
/** @public */
export declare const DEFAULT_ANNOTATION_RECT_STYLE: RectAnnotationStyle;
/** @public */
export declare function mergeWithDefaultAnnotationLine(config?: RecursivePartial<LineAnnotationStyle>): LineAnnotationStyle;
/** @public */
export declare function mergeWithDefaultAnnotationRect(config?: RecursivePartial<RectAnnotationStyle>): RectAnnotationStyle;
//# sourceMappingURL=merge_utils.d.ts.map