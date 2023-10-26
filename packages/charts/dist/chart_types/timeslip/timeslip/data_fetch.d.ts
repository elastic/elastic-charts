import { BoxplotRow } from './render/glyphs/boxplot';
/** @public */
export type TimeslipDataRows = Array<{
    epochMs: number;
    boxplot?: BoxplotRow['boxplot'];
    value?: number;
}>;
//# sourceMappingURL=data_fetch.d.ts.map