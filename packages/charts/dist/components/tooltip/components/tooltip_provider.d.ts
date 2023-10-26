import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { Datum } from '../../../utils/common';
import { TooltipStyle } from '../../../utils/themes/theme';
import { CustomTooltipProps, PinTooltipCallback } from '../types';
/** @public */
export interface TooltipContext<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> {
    theme: TooltipStyle;
    backgroundColor: string;
    dir: 'rtl' | 'ltr';
    maxItems: number;
    actionable: boolean;
    pinned: boolean;
    canPinTooltip: boolean;
    pinTooltip: PinTooltipCallback;
    values: TooltipValue<D, SI>[];
    selected: Array<TooltipValue<D, SI>>;
    toggleSelected: CustomTooltipProps['toggleSelected'];
    setSelection: CustomTooltipProps['setSelection'];
}
/** @public */
export declare const useTooltipContext: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>() => TooltipContext<D, SI>;
//# sourceMappingURL=tooltip_provider.d.ts.map