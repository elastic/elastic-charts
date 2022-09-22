import { CSSProperties, ReactNode } from 'react';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum } from '../../../specs';
import { TooltipValue } from '../../../specs/tooltip';
import { Datum } from '../../../utils/common';
/**
 * Styles to apply to tooltip table cell
 * @public */
export declare type TooltipCellStyle = Pick<CSSProperties, 'maxHeight' | 'textAlign' | 'padding' | 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;
/**
 * Base table column definition
 * @alpha
 */
export declare type TooltipTableColumnBase<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = {
    /**
     * Identifier for column to be used in callbacks if needed
     */
    id?: string;
    /**
     * ClassName to be applied to table cells within column (i.e. `td` or `th`)
     */
    className?: string;
    /**
     * Table column header
     */
    header?: string | ((items: TooltipValue<D, SI>[]) => string);
    /**
     * Table column footer
     */
    footer?: string | ((items: TooltipValue<D, SI>[]) => string);
    /**
     * Boolean to hide entire column from table
     */
    hidden?: boolean | ((items: TooltipValue<D, SI>[]) => boolean);
    /**
     * Limited styles to apply to table cells within column (i.e. `td` or `th`)
     */
    style?: TooltipCellStyle;
};
/**
 * Table column definition for fully custom values
 * @alpha
 */
export interface TooltipTableColumnCustom<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> extends TooltipTableColumnBase<D, SI> {
    type: 'custom';
    /**
     * Renders column cell element inside a `td` element
     */
    cell: (item: TooltipValue<D, SI>) => ReactNode;
}
/**
 * Table column definition for color strip
 * @alpha
 */
export interface TooltipTableColumnColor<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> extends Omit<TooltipTableColumnBase<D, SI>, 'header' | 'footer'> {
    type: 'color';
    header?: never;
    footer?: never;
}
/**
 * Table column definition for number values
 * @alpha
 */
export interface TooltipTableColumnNumber<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> extends TooltipTableColumnBase<D, SI> {
    type: 'number';
    /**
     * Renders column cell element inside a `td` element
     */
    cell: (item: TooltipValue<D, SI>) => string | number;
}
/**
 * Table column definition for text values
 * @alpha
 */
export interface TooltipTableColumnText<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> extends TooltipTableColumnBase<D, SI> {
    type: 'text';
    /**
     * Renders column cell element inside a `td` element
     */
    cell: (item: TooltipValue<D, SI>) => string;
}
/**
 * Table column definition for number values
 *
 * @alpha
 */
export declare type TooltipTableColumn<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = TooltipTableColumnCustom<D, SI> | TooltipTableColumnColor<D, SI> | TooltipTableColumnNumber<D, SI> | TooltipTableColumnText<D, SI>;
//# sourceMappingURL=types.d.ts.map