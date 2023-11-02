/// <reference types="react" />
import { BaseDatum, TooltipHeaderFormatter } from '../../../specs';
import { PointerValue } from '../../../state/types';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
/** @public */
export type TooltipHeaderProps<D extends BaseDatum = Datum> = PropsOrChildrenWithProps<{
    header?: PointerValue<D> | null;
    formatter?: TooltipHeaderFormatter<D>;
}>;
/** @public */
export declare const TooltipHeader: <D extends BaseDatum = any>(props: TooltipHeaderProps<D>) => JSX.Element | null;
//# sourceMappingURL=tooltip_header.d.ts.map