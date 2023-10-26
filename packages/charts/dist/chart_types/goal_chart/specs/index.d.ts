import { ComponentProps } from 'react';
import { GoalSubtype } from './constants';
import { ChartType } from '../..';
import { Color } from '../../../common/colors';
import { Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { SFProps } from '../../../state/spec_factory';
import { LabelAccessor, ValueFormatter } from '../../../utils/common';
/** @alpha */
export interface BandFillColorAccessorInput {
    value: number;
    index: number;
    base: number;
    target?: number;
    highestValue: number;
    lowestValue: number;
    aboveBaseCount: number;
    belowBaseCount: number;
}
/** @alpha */
export type BandFillColorAccessor = (input: BandFillColorAccessorInput) => Color;
/** @alpha */
export type GoalLabelAccessor = LabelAccessor<BandFillColorAccessorInput>;
/** @alpha */
export interface GoalDomainRange {
    /**
     * A finite number to defined the lower bound of the domain. Defaults to 0 if _not_ finite.
     */
    min: number;
    /**
     * A finite number to defined the upper bound of the domain. Defaults to 1 if _not_ finite.
     */
    max: number;
}
/** @alpha */
export interface GoalSpec extends Spec {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Goal;
    subtype: GoalSubtype;
    base: number;
    target?: number;
    actual: number;
    /**
     * array of discrete band intervals or approximate number of desired bands
     */
    bands?: number | number[];
    /**
     * Array of discrete tick values or approximate number of desired ticks
     */
    ticks?: number | number[];
    /**
     * Domain of goal charts. Limits every value to within domain.
     */
    domain: GoalDomainRange;
    bandFillColor: BandFillColorAccessor;
    tickValueFormatter: GoalLabelAccessor;
    labelMajor: string | GoalLabelAccessor;
    labelMinor: string | GoalLabelAccessor;
    centralMajor: string | GoalLabelAccessor;
    centralMinor: string | GoalLabelAccessor;
    angleStart: number;
    angleEnd: number;
    bandLabels: string[];
    tooltipValueFormatter: ValueFormatter;
}
declare const buildProps: import("../../../state/spec_factory").BuildProps<GoalSpec, "chartType" | "specType", "base" | "actual" | "bandFillColor" | "tickValueFormatter" | "labelMajor" | "labelMinor" | "centralMajor" | "centralMinor" | "angleStart" | "angleEnd" | "bandLabels" | "tooltipValueFormatter", "target" | "bands" | "ticks", "id" | "domain" | "subtype">;
/**
 * Add Goal spec to chart
 * @alpha
 */
export declare const Goal: (props: SFProps<GoalSpec, keyof (typeof buildProps)['overrides'], keyof (typeof buildProps)['defaults'], keyof (typeof buildProps)['optionals'], keyof (typeof buildProps)['requires']>) => null;
/** @public */
export type GoalProps = ComponentProps<typeof Goal>;
export {};
//# sourceMappingURL=index.d.ts.map