import { CSSProperties } from 'react';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableColumn } from './types';
declare type TooltipTableProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<{
    columns: TooltipTableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
    pinned: boolean;
    onSelect: typeof onTooltipItemSelected | ((...args: Parameters<typeof onTooltipItemSelected>) => void);
    selected: TooltipValue<D, SI>[];
}, {}, {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
}>;
/** @public */
export declare const TooltipTable: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>({ className, maxHeight, ...props }: TooltipTableProps<D, SI>) => JSX.Element;
export {};
//# sourceMappingURL=tooltip_table.d.ts.map