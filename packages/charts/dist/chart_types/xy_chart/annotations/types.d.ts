import { ComponentType } from 'react';
import { LineAnnotationDatum, RectAnnotationDatum } from '../utils/specs';
/** @public */
export type AnnotationTooltipFormatter = ComponentType<{
    details?: string;
}>;
/** @public */
export type CustomAnnotationTooltip = ComponentType<{
    header?: string;
    details?: string;
    datum: LineAnnotationDatum | RectAnnotationDatum;
}> | null;
/**
 * Component to render based on annotation datum
 *
 * @public
 */
export type ComponentWithAnnotationDatum<D = any> = ComponentType<LineAnnotationDatum<D>>;
//# sourceMappingURL=types.d.ts.map