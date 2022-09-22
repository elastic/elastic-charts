import { CSSProperties, PropsWithChildren } from 'react';
declare type TooltipTableRowProps = PropsWithChildren<{
    id?: string;
    className?: string;
    isHighlighted?: boolean;
    isSelected?: boolean;
    maxHeight?: CSSProperties['maxHeight'];
    onSelect?: () => void;
}>;
/** @public */
export declare const TooltipTableRow: ({ id, maxHeight, isHighlighted, isSelected, children, onSelect, className, }: TooltipTableRowProps) => JSX.Element;
export {};
//# sourceMappingURL=tooltip_table_row.d.ts.map