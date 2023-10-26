import { TimeslipDataRows } from './timeslip/data_fetch';
import { DataDemand } from './timeslip/render/cartesian';
import { ChartType } from '..';
import { Spec } from '../../specs';
import { SpecType } from '../../specs/constants';
import { SFProps } from '../../state/spec_factory';
/**
 * data getter function
 * @public
 */
export type GetData = (dataDemand: DataDemand) => TimeslipDataRows;
/**
 * Specifies the timeslip chart
 * @public
 */
export interface TimeslipSpec extends Spec {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Timeslip;
    getData: GetData;
}
declare const buildProps: import("../../state/spec_factory").BuildProps<TimeslipSpec, "chartType" | "specType", never, never, "id" | "getData">;
/**
 * Adds timeslip spec to chart specs
 * @public
 */
export declare const Timeslip: (props: SFProps<TimeslipSpec, keyof (typeof buildProps)['overrides'], keyof (typeof buildProps)['defaults'], keyof (typeof buildProps)['optionals'], keyof (typeof buildProps)['requires']>) => null;
export {};
//# sourceMappingURL=timeslip_api.d.ts.map