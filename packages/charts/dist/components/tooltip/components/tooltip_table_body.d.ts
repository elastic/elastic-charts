import { CSSProperties } from 'react';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { onTooltipItemSelected } from '../../../state/actions/tooltip';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
import { TooltipTableColumn } from './types';
declare type TooltipTableBodyProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<{
    items: TooltipValue<D, SI>[];
    columns: TooltipTableColumn<D, SI>[];
    pinned: boolean;
    onSelect: typeof onTooltipItemSelected | ((...args: Parameters<typeof onTooltipItemSelected>) => void);
    selected: TooltipValue<D, SI>[];
}, {}, {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
}>;
/** @public */
export declare const TooltipTableBody: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>({ className, ...props }: TooltipTableBodyProps<D, SI>) => JSX.Element;
export {};
//# sourceMappingURL=tooltip_table_body.d.ts.map