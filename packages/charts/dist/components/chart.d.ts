import React from 'react';
import { LegendPositionConfig, PointerEvent } from '../specs';
import { ChartSize } from '../utils/chart_size';
interface ChartProps {
    /**
     * The type of rendered
     * @defaultValue `canvas`
     */
    renderer?: 'svg' | 'canvas';
    size?: ChartSize;
    className?: string;
    id?: string;
}
interface ChartState {
    legendDirection: LegendPositionConfig['direction'];
}
/** @public */
export declare class Chart extends React.Component<ChartProps, ChartState> {
    static defaultProps: ChartProps;
    private unsubscribeToStore;
    private chartStore;
    private chartContainerRef;
    private chartStageRef;
    constructor(props: ChartProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
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