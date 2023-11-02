import React, { ReactNode } from 'react';
import { OptionalKeys } from 'utility-types';
import { LegendPositionConfig, PointerEvent } from '../specs';
import { ChartSize } from '../utils/chart_size';
/** @public */
export interface ChartProps {
    /**
     * The type of rendered
     * @defaultValue `canvas`
     */
    renderer?: 'svg' | 'canvas';
    size?: ChartSize;
    className?: string;
    id?: string;
    title?: string;
    description?: string;
    children?: ReactNode;
}
interface ChartState {
    legendDirection: LegendPositionConfig['direction'];
    paddingLeft: number;
    paddingRight: number;
    displayTitles: boolean;
}
/** @public */
export declare class Chart extends React.Component<ChartProps, ChartState> {
    static defaultProps: Pick<ChartProps, OptionalKeys<ChartProps>>;
    private unsubscribeToStore;
    private chartStore;
    private chartContainerRef;
    private chartStageRef;
    constructor(props: ChartProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate({ title, description }: Readonly<ChartProps>): void;
    getPNGSnapshot(options?: {
        backgroundColor: string;
    }): {
        blobOrDataUrl: any;
        browser: 'IE11' | 'other';
    } | null;
    getChartContainerRef: () => React.RefObject<HTMLDivElement>;
    dispatchExternalPointerEvent(event: PointerEvent): void;
    render(): JSX.Element;
}
export {};
//# sourceMappingURL=chart.d.ts.map