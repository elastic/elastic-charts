import { $Values as Values } from 'utility-types';
import { Color } from '../../../../common/colors';
import { FontStyle } from '../../../../common/text_utils';
/** @public */
export interface WordModel {
    text: string;
    weight: number;
    color: Color;
}
/** @public */
export declare const WeightFn: Readonly<{
    log: "log";
    linear: "linear";
    exponential: "exponential";
    squareRoot: "squareRoot";
}>;
/** @public */
export type WeightFn = Values<typeof WeightFn>;
/** @public */
export type OutOfRoomCallback = (wordCount: number, renderedWordCount: number, renderedWords: string[]) => void;
/** @public */
export interface WordcloudViewModel {
    startAngle: number;
    endAngle: number;
    angleCount: number;
    padding: number;
    fontWeight: number;
    fontFamily: string;
    fontStyle: FontStyle;
    minFontSize: number;
    maxFontSize: number;
    spiral: string;
    exponent: number;
    data: WordModel[];
    weightFn: WeightFn;
    outOfRoomCallback: OutOfRoomCallback;
}
//# sourceMappingURL=viewmodel_types.d.ts.map