import { ComponentProps } from 'react';
import { ChartType } from '../..';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { WordcloudViewModel } from '../layout/types/viewmodel_types';
/** @alpha */
export interface WordcloudSpec extends Spec, WordcloudViewModel {
    chartType: typeof ChartType.Wordcloud;
    specType: typeof SpecType.Series;
}
/**
 * Adds wordcloud spec to chart
 * @alpha
 */
export declare const Wordcloud: import("react").FC<import("../../../state/spec_factory").SFProps<WordcloudSpec, "chartType" | "specType", "data" | "fontFamily" | "fontStyle" | "fontWeight" | "padding" | "exponent" | "minFontSize" | "maxFontSize" | "startAngle" | "endAngle" | "angleCount" | "spiral" | "weightFn" | "outOfRoomCallback", never, "id">>;
/** @public */
export type WordcloudProps = ComponentProps<typeof Wordcloud>;
export { WordModel, WeightFn, OutOfRoomCallback } from '../layout/types/viewmodel_types';
//# sourceMappingURL=index.d.ts.map