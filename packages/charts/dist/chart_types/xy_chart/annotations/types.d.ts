import { ComponentType } from 'react';
import { LineAnnotationDatum, RectAnnotationDatum } from '../utils/specs';
/** @public */
export declare type AnnotationTooltipFormatter = (details?: string) => JSX.Element | null;
/** @public */
export declare type CustomAnnotationTooltip = ComponentType<{
    header?: string;
    details?: string;
    datum: LineAnnotationDatum | RectAnnotationDatum;
}> | null;
/**
 * Component to render based on annotation datum
 *
 * @public
 */
export declare type ComponentWithAnnotationDatum<D = any> = ComponentType<LineAnnotationDatum<D>>;
//# sourceMappingURL=types.d.ts.map