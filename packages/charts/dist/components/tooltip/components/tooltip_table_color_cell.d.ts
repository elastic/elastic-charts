/// <reference types="react" />
import { TooltipTableCellProps } from './tooltip_table_cell';
/** @public */
export type ColorStripCellProps = Omit<TooltipTableCellProps, 'children' | 'width'> & {
    color?: string;
    displayOnly?: boolean;
};
/**
 * Renders color strip column cell
 * @public
 */
export declare function TooltipTableColorCell({ color, className, displayOnly, ...cellProps }: ColorStripCellProps): JSX.Element | null;
//# sourceMappingURL=tooltip_table_color_cell.d.ts.map