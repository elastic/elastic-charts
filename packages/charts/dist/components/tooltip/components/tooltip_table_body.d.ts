/// <reference types="react" />
import { TooltipTableColumn } from './types';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps, ToggleSelectedTooltipItemCallback } from '../types';
type TooltipTableBodyProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<{
    items: TooltipValue<D, SI>[];
    columns: TooltipTableColumn<D, SI>[];
    pinned?: boolean;
    onSelect?: ToggleSelectedTooltipItemCallback;
    selected: TooltipValue<D, SI>[];
}, {}, {
    className?: string;
}>;
/** @public */
export declare const TooltipTableBody: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>({ className, ...props }: TooltipTableBodyProps<D, SI>) => JSX.Element;
export {};
//# sourceMappingURL=tooltip_table_body.d.ts.map