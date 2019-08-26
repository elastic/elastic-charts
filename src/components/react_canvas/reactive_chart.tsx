import { inject, observer } from 'mobx-react';
import React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { isLineAnnotation, isRectAnnotation } from '../../chart_types/xy_chart/utils/specs';
import { LineAnnotationStyle, RectAnnotationStyle } from '../../utils/themes/theme';
import { AnnotationId } from '../../utils/ids';
import {
  AnnotationDimensions,
  AnnotationLineProps,
  AnnotationRectProps,
} from '../../chart_types/xy_chart/annotations/annotation_utils';
import { ChartStore, Point } from '../../chart_types/xy_chart/store/chart_state';
import { BrushExtent } from '../../chart_types/xy_chart/store/utils';
import { AreaGeometries } from './area_geometries';
import { Axis } from './axis';
import { BarGeometries } from './bar_geometries';
import { BarValues } from './bar_values';
import { Grid } from './grid';
import { LineAnnotation } from './line_annotation';
import { LineGeometries } from './line_geometries';
import { RectAnnotation } from './rect_annotation';

interface ReactiveChartProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}
interface ReactiveChartState {
  brushing: boolean;
  brushStart: Point;
  brushEnd: Point;
  bbox: {
    left: number;
    top: number;
  };
}

interface ReactiveChartElementIndex {
  element: JSX.Element;
  zIndex: number;
}

function limitPoint(value: number, min: number, max: number) {
  if (value > max) {
    return max;
  } else if (value < min) {
    return min;
  } else {
    return value;
  }
}
function getPoint(event: MouseEvent, extent: BrushExtent): Point {
  const point = {
    x: limitPoint(event.layerX, extent.minX, extent.maxX),
    y: limitPoint(event.layerY, extent.minY, extent.maxY),
  };
  return point;
}
class Chart extends React.Component<ReactiveChartProps, ReactiveChartState> {
  static displayName = 'ReactiveChart';
  firstRender = true;
  state = {
    brushing: false,
    brushStart: {
      x: 0,
      y: 0,
    },
    brushEnd: {
      x: 0,
      y: 0,
    },
    bbox: {
      left: 0,
      top: 0,
    },
  };

  renderBarSeries = (): ReactiveChartElementIndex[] => {
    const { geometries, canDataBeAnimated, chartTheme } = this.props.chartStore!;
    if (!geometries) {
      return [];
    }
    const highlightedLegendItem = this.getHighlightedLegendItem();

    const element = (
      <BarGeometries
        key={'bar-geometries'}
        animated={canDataBeAnimated}
        bars={geometries.bars}
        sharedStyle={chartTheme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
      />
    );

    return [
      {
        element,
        zIndex: 0,
      },
    ];
  };
  renderLineSeries = (): ReactiveChartElementIndex[] => {
    const { geometries, canDataBeAnimated, chartTheme } = this.props.chartStore!;
    if (!geometries) {
      return [];
    }

    const highlightedLegendItem = this.getHighlightedLegendItem();

    const element = (
      <LineGeometries
        key={'line-geometries'}
        animated={canDataBeAnimated}
        lines={geometries.lines}
        sharedStyle={chartTheme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
      />
    );

    return [
      {
        element,
        zIndex: 0,
      },
    ];
  };
  renderAreaSeries = (): ReactiveChartElementIndex[] => {
    const { geometries, canDataBeAnimated, chartTheme } = this.props.chartStore!;
    if (!geometries) {
      return [];
    }

    const highlightedLegendItem = this.getHighlightedLegendItem();

    const element = (
      <AreaGeometries
        key={'area-geometries'}
        animated={canDataBeAnimated}
        areas={geometries.areas}
        sharedStyle={chartTheme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
      />
    );

    return [
      {
        element,
        zIndex: 0,
      },
    ];
  };
  renderAxes = () => {
    const {
      axesVisibleTicks,
      axesSpecs,
      axesTicksDimensions,
      axesPositions,
      chartTheme,
      debug,
      chartDimensions,
    } = this.props.chartStore!;

    const axesComponents: JSX.Element[] = [];
    axesVisibleTicks.forEach((axisTicks, axisId) => {
      const axisSpec = axesSpecs.get(axisId);
      const axisTicksDimensions = axesTicksDimensions.get(axisId);
      const axisPosition = axesPositions.get(axisId);
      const ticks = axesVisibleTicks.get(axisId);
      if (!ticks || !axisSpec || !axisTicksDimensions || !axisPosition) {
        return;
      }
      axesComponents.push(
        <Axis
          key={`axis-${axisId}`}
          axisSpec={axisSpec}
          axisTicksDimensions={axisTicksDimensions}
          axisPosition={axisPosition}
          ticks={ticks}
          chartTheme={chartTheme}
          debug={debug}
          chartDimensions={chartDimensions}
        />,
      );
    });
    return axesComponents;
  };

  renderGrids = () => {
    const { axesGridLinesPositions, axesSpecs, chartDimensions, debug } = this.props.chartStore!;

    const gridComponents: JSX.Element[] = [];
    axesGridLinesPositions.forEach((axisGridLinesPositions, axisId) => {
      const axisSpec = axesSpecs.get(axisId);
      if (axisSpec && axisGridLinesPositions.length > 0) {
        gridComponents.push(
          <Grid
            key={`axis-grid-${axisId}`}
            chartDimensions={chartDimensions}
            debug={debug}
            gridLineStyle={axisSpec.gridLineStyle}
            linesPositions={axisGridLinesPositions}
          />,
        );
      }
    });
    return gridComponents;
  };

  renderAnnotations = (): ReactiveChartElementIndex[] => {
    const { annotationDimensions, annotationSpecs, chartDimensions, debug } = this.props.chartStore!;

    const annotationElements: ReactiveChartElementIndex[] = [];
    annotationDimensions.forEach((annotation: AnnotationDimensions, id: AnnotationId) => {
      const spec = annotationSpecs.get(id);

      if (!spec) {
        return;
      }

      const zIndex = spec.zIndex || 0;
      let element;
      if (isLineAnnotation(spec)) {
        const lineStyle = spec.style as LineAnnotationStyle;

        element = (
          <LineAnnotation
            key={`annotation-${id}`}
            chartDimensions={chartDimensions}
            debug={debug}
            lines={annotation as AnnotationLineProps[]}
            lineStyle={lineStyle}
          />
        );
      } else if (isRectAnnotation(spec)) {
        const rectStyle = spec.style as RectAnnotationStyle;

        element = (
          <RectAnnotation
            key={`annotation-${id}`}
            chartDimensions={chartDimensions}
            debug={debug}
            rects={annotation as AnnotationRectProps[]}
            rectStyle={rectStyle}
          />
        );
      }

      if (element) {
        annotationElements.push({
          element,
          zIndex,
        });
      }
    });
    return annotationElements;
  };

  renderBarValues = () => {
    const { debug, chartDimensions, geometries, chartTheme, chartRotation } = this.props.chartStore!;
    if (!geometries) {
      return;
    }
    const props = {
      debug,
      chartDimensions,
      chartRotation,
      bars: geometries.bars,
      // displayValue is guaranteed on style as part of the merged theme
      displayValueStyle: chartTheme.barSeriesStyle.displayValue!,
    };
    return <BarValues {...props} />;
  };

  renderBrushTool = () => {
    const { brushing, brushStart, brushEnd } = this.state;
    const { chartDimensions, chartRotation, chartTransform } = this.props.chartStore!;
    if (!brushing) {
      return null;
    }
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    // x = {chartDimensions.left + chartTransform.x};
    // y = {chartDimensions.top + chartTransform.y};
    if (chartRotation === 0 || chartRotation === 180) {
      x = brushStart.x;
      y = chartDimensions.top + chartTransform.y;
      width = brushEnd.x - brushStart.x;
      height = chartDimensions.height;
    } else {
      x = chartDimensions.left + chartTransform.x;
      y = brushStart.y;
      width = chartDimensions.width;
      height = brushEnd.y - brushStart.y;
    }
    return <Rect x={x} y={y} width={width} height={height} fill="gray" opacity={0.6} />;
  };
  onStartBrusing = (event: { evt: MouseEvent }) => {
    window.addEventListener('mouseup', this.onEndBrushing);
    const { brushExtent } = this.props.chartStore!;
    const point = getPoint(event.evt, brushExtent);
    this.setState(() => ({
      brushing: true,
      brushStart: point,
      brushEnd: point,
    }));
  };
  onEndBrushing = () => {
    window.removeEventListener('mouseup', this.onEndBrushing);
    const { brushStart, brushEnd } = this.state;
    this.props.chartStore!.onBrushEnd(brushStart, brushEnd);
    this.setState(() => ({
      brushing: false,
      brushStart: { x: 0, y: 0 },
      brushEnd: { x: 0, y: 0 },
    }));
  };
  onBrushing = (event: { evt: MouseEvent }) => {
    if (!this.state.brushing) {
      return;
    }
    if (!this.props.chartStore!.isBrushing.get()) {
      this.props.chartStore!.onBrushStart();
    }
    const { brushExtent } = this.props.chartStore!;
    const point = getPoint(event.evt, brushExtent);
    this.setState(() => ({
      brushEnd: point,
    }));
  };

  sortAndRenderElements() {
    const bars = this.renderBarSeries();
    const areas = this.renderAreaSeries();
    const lines = this.renderLineSeries();
    const annotations = this.renderAnnotations();

    return [...bars, ...areas, ...lines, ...annotations]
      .sort((elemIdxA, elemIdxB) => elemIdxA.zIndex - elemIdxB.zIndex)
      .map((elemIdx) => elemIdx.element);
  }

  render() {
    const { chartInitialized } = this.props.chartStore!;
    if (!chartInitialized.get()) {
      return null;
    }

    const {
      parentDimensions,
      chartDimensions,
      chartRotation,
      chartTransform,
      debug,
      isChartEmpty,
    } = this.props.chartStore!;

    if (isChartEmpty.get()) {
      return (
        <div className="echReactiveChart_unavailable">
          <p>No data to display</p>
        </div>
      );
    }

    let brushProps = {};
    const isBrushEnabled = this.props.chartStore!.isBrushEnabled();
    if (isBrushEnabled) {
      brushProps = {
        onMouseDown: this.onStartBrusing,
        onMouseMove: this.onBrushing,
      };
    }

    return (
      <Stage
        width={parentDimensions.width}
        height={parentDimensions.height}
        style={{
          width: '100%',
          height: '100%',
        }}
        {...brushProps}
      >
        <Layer hitGraphEnabled={false} listening={false}>
          {this.renderGrids()}
        </Layer>
        <Layer hitGraphEnabled={false} listening={false}>
          {this.renderAxes()}
        </Layer>

        <Layer
          x={chartDimensions.left + chartTransform.x}
          y={chartDimensions.top + chartTransform.y}
          rotation={chartRotation}
          hitGraphEnabled={false}
          listening={false}
        >
          {this.sortAndRenderElements()}
        </Layer>

        {debug && (
          <Layer hitGraphEnabled={false} listening={false}>
            {this.renderDebugChartBorders()}
          </Layer>
        )}
        {isBrushEnabled && (
          <Layer hitGraphEnabled={false} listening={false}>
            {this.renderBrushTool()}
          </Layer>
        )}

        <Layer hitGraphEnabled={false} listening={false}>
          {this.renderBarValues()}
        </Layer>
      </Stage>
    );
  }

  private renderDebugChartBorders = () => {
    const { chartDimensions } = this.props.chartStore!;
    return (
      <Rect
        x={chartDimensions.left}
        y={chartDimensions.top}
        width={chartDimensions.width}
        height={chartDimensions.height}
        stroke="red"
        strokeWidth={4}
        listening={false}
        dash={[4, 4]}
      />
    );
  };

  private getHighlightedLegendItem = () => {
    return this.props.chartStore!.highlightedLegendItem.get();
  };
}

export const ReactiveChart = inject('chartStore')(observer(Chart));
