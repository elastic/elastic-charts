import { ComponentType, ReactNode } from 'react';
import { SeriesIdentifier } from '../../common/series_id';
import { BaseDatum, TooltipValue, TooltipValueFormatter } from '../../specs';
import { Datum } from '../../utils/common';
/**
 * The set of info used to render the a tooltip.
 * @public
 */
export interface TooltipInfo<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
    /**
     * The TooltipValue for the header. On XYAxis chart the x value
     */
    header: TooltipValue<D, SI> | null;
    /**
     * The array of {@link TooltipValue}s to show on the tooltip.
     * On XYAxis chart correspond to the set of y values for each series
     */
    values: TooltipValue<D, SI>[];
}
/**
 * The set of info used to render the a tooltip.
 * @public
 */
export interface CustomTooltipProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> extends TooltipInfo<D, SI> {
    headerFormatter?: TooltipValueFormatter<D, SI>;
    dir: 'ltr' | 'rtl';
    backgroundColor: string;
}
/**
 * The react component used to render a custom tooltip
 * @public
 */
export declare type CustomTooltip<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = ComponentType<CustomTooltipProps<D, SI>>;
/**
 * Defines exported component props with union of props **with** `children`
 * @public
 */
export declare type PropsWithChildren<ChildrenProps extends Record<string, unknown> = Record<string, any>, ExtraProps extends Record<string, unknown> = Record<string, any>, Props extends Record<string, unknown> = Record<string, any>> = {
    children: ReactNode;
} & ChildrenProps & ExtraProps & Neverify<Props>;
/**
 * Defines exported component props with union of props **without** `children`
 * @public
 */
export declare type PropsWithoutChildren<Props extends Record<string, unknown> = Record<string, any>, ExtraProps extends Record<string, unknown> = Record<string, any>, ChildrenProps extends Record<string, unknown> = Record<string, any>> = {
    children?: never | undefined;
} & Neverify<ChildrenProps> & Props & ExtraProps;
/**
 * Type used to define a union including and excluding children as a prop
 * @public
 */
export declare type PropsOrChildrenWithProps<Props extends Record<string, unknown> = Record<string, any>, ChildrenProps extends Record<string, unknown> = Record<string, any>, ExtraProps extends Record<string, unknown> = Record<string, any>> = PropsWithChildren<ChildrenProps, ExtraProps, Props> | PropsWithoutChildren<Props, ExtraProps, ChildrenProps>;
/**
 * Converts all properties of a Record to optional-never
 * @public
 */
export declare type Neverify<T extends Record<string, unknown>> = {
    [Key in keyof T]?: never;
};
//# sourceMappingURL=types.d.ts.map