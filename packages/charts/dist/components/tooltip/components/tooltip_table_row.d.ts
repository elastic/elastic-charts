import { PropsWithChildren } from 'react';
type TooltipTableRowProps = PropsWithChildren<{
    id?: string;
    className?: string;
    isHighlighted?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
}>;
/** @public */
export declare const TooltipTableRow: ({ id, isHighlighted, isSelected, children, onSelect, className, }: TooltipTableRowProps) => JSX.Element;
export {};
//# sourceMappingURL=tooltip_table_row.d.ts.map