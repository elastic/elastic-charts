import { CSSProperties } from 'react';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableColumn } from './types';
declare type TooltipTableHeaderProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<{
    columns: TooltipTableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
}, {}, {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
}>;
/** @public */
export declare const TooltipTableHeader: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>({ maxHeight, className, ...props }: TooltipTableHeaderProps<D, SI>) => JSX.Element | null;
export {};
//# sourceMappingURL=tooltip_table_header.d.ts.map