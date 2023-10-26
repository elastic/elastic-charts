/** @public */
export type RandomNumberGenerator = (min?: number, max?: number, fractionDigits?: number, inclusive?: boolean) => number;
/** @public */
export declare class DataGenerator {
    private randomNumberGenerator;
    private generator;
    private frequency;
    constructor(frequency?: number, randomNumberGenerator?: RandomNumberGenerator);
    generateBasicSeries(totalPoints?: number, offset?: number, amplitude?: number): {
        x: number;
        y: number;
    }[];
    generateSimpleSeries(totalPoints?: number, groupIndex?: number, groupPrefix?: string): {
        x: number;
        y: number;
        g: string;
    }[];
    generateGroupedSeries(totalPoints?: number, totalGroups?: number, groupPrefix?: string): {
        x: number;
        y: number;
        g: string;
    }[];
    generateRandomSeries(totalPoints?: number, groupIndex?: number, groupPrefix?: string): {
        x: number;
        y: number;
        z: number;
        g: string;
    }[];
    generateRandomGroupedSeries(totalPoints?: number, totalGroups?: number, groupPrefix?: string): {
        x: number;
        y: number;
        z: number;
        g: string;
    }[];
    /**
     * Generate data given a list or number of vertical and/or horizontal panels
     */
    generateSMGroupedSeries<T extends Record<string, any>>(verticalGroups: Array<number | string> | number, horizontalGroups: Array<number | string> | number, seriesGenerator: (h: string | number, v: string | number) => T[]): ({
        h: string | number;
        v: string | number;
    } & T)[];
}
//# sourceMappingURL=data_generator.d.ts.map