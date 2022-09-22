import { PropsWithChildren } from 'react';
import { TooltipCellStyle } from './types';
/** @public */
export declare type TooltipTableCellProps = PropsWithChildren<{
    tagName?: 'td' | 'th';
    className?: string;
    style?: TooltipCellStyle;
}>;
/** @public */
export declare const TooltipTableCell: ({ style, tagName, className, children }: TooltipTableCellProps) => JSX.Element;
//# sourceMappingURL=tooltip_table_cell.d.ts.map