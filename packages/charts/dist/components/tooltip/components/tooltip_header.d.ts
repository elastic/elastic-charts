/// <reference types="react" />
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue, TooltipValueFormatter } from '../../../specs';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps } from '../types';
declare type TooltipHeaderProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<{
    header: TooltipValue<D, SI> | null;
    formatter?: TooltipValueFormatter<D, SI>;
}>;
/** @public */
export declare const TooltipHeader: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>(props: TooltipHeaderProps<D, SI>) => JSX.Element | null;
export {};
//# sourceMappingURL=tooltip_header.d.ts.map