import { PropsWithChildren } from 'react';
import { TooltipCellStyle } from './types';
/** @public */
export type TooltipTableCellProps = PropsWithChildren<{
    tagName?: 'td' | 'th';
    truncate?: boolean;
    className?: string;
    title?: string;
    style?: TooltipCellStyle;
}>;
/** @public */
export declare const TooltipTableCell: ({ style, truncate, tagName, className, children, title: manualTitle, }: TooltipTableCellProps) => JSX.Element;
//# sourceMappingURL=tooltip_table_cell.d.ts.map