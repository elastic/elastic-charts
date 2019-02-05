import { Layer as KonvaLayer } from 'konva';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { ChartStore, Point } from '../../state/chart_state';
import { BrushExtent } from '../../state/utils';
import { AreaGeometries } from './area_geometries';
import { Axis } from './axis';
import { BarGeometries } from './bar_geometries';
import { Grid } from './grid';
import { LineGeometries } from './line_geometries';

interface ReactiveChartProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}

interface ReactiveChartState {
  brushing: boolean;
  brushStart: Point;
  brushEnd: Point;
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
  };
  private renderingLayerRef: React.RefObject<KonvaLayer> = React.createRef();
  componentDidMount() {
    // tslint:disable-next-line:no-console
    console.log('Chart mounted');
  }

  componentWillUnmount() {
    // tslint:disable-next-line:no-console
    console.log('Chart unmounted');
  }

  renderBarSeries = () => {
    const {
      geometries,
      canDataBeAnimated,
      onOverElement,
      onOutElement,
      onElementClickListener,
    } = this.props.chartStore!;
    if (!geometries) {
      return;
    }
    return (
      <BarGeometries
        animated={canDataBeAnimated}
        bars={geometries.bars}
        onElementOver={onOverElement}
        onElementOut={onOutElement}
        onElementClick={onElementClickListener}
      />
    );
  }
  renderLineSeries = () => {
    const {
      geometries,
      canDataBeAnimated,
      chartTheme,
      onOverElement,
      onOutElement,
      onElementClickListener,
    } = this.props.chartStore!;
    if (!geometries) {
      return;
    }
    return (
      <LineGeometries
        animated={canDataBeAnimated}
        lines={geometries.lines}
        style={chartTheme.chart.styles.lineSeries}
        onElementOver={onOverElement}
        onElementOut={onOutElement}
        onElementClick={onElementClickListener}
      />
    );
  }
  renderAreaSeries = () => {
    const {
      geometries,
      canDataBeAnimated,
      chartTheme,
      onOverElement,
      onOutElement,
      onElementClickListener,
    } = this.props.chartStore!;
    if (!geometries) {
      return;
    }
    return (
      <AreaGeometries
        animated={canDataBeAnimated}
        areas={geometries.areas}
        style={chartTheme.chart.styles.areaSeries}
        onElementOver={onOverElement}
        onElementOut={onOutElement}
        onElementClick={onElementClickListener}
      />
    );
  }
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
  }

  renderGrids = () => {
    const {
      axesGridLinesPositions,
      axesSpecs,
      chartDimensions,
      debug,
    } = this.props.chartStore!;

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
  }

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
  }
  onStartBrusing = (event: { evt: MouseEvent }) => {
    const { brushExtent } = this.props.chartStore!;
    const point = getPoint(event.evt, brushExtent);
    this.setState(() => ({
      brushing: true,
      brushStart: point,
      brushEnd: point,
    }));
  }
  onEndBrushing = () => {
    const { brushStart, brushEnd } = this.state;
    this.props.chartStore!.onBrushEnd(brushStart, brushEnd);
    this.setState(() => ({
      brushing: false,
      brushStart: { x: 0, y: 0 },
      brushEnd: { x: 0, y: 0 },
    }));
  }
  onBrushing = (event: { evt: MouseEvent }) => {
    if (!this.state.brushing) {
      return;
    }
    const { brushExtent } = this.props.chartStore!;
    const point = getPoint(event.evt, brushExtent);
    this.setState(() => ({
      brushEnd: point,
    }));
  }

  render() {
    const { initialized, debug } = this.props.chartStore!;
    if (!initialized.get()) {
      return null;
    }

    const {
      parentDimensions,
      chartDimensions,
      chartRotation,
      chartTransform,
      tooltipData,
      setTooltipPosition,
    } = this.props.chartStore!;

    // disable clippings when debugging
    const clippings = debug
      ? {}
      : {
        clipX: 0,
        clipY: 0,
        clipWidth: [90, -90].includes(chartRotation)
          ? chartDimensions.height
          : chartDimensions.width,
        clipHeight: [90, -90].includes(chartRotation)
          ? chartDimensions.width
          : chartDimensions.height,
      };

    let brushProps = {};
    const isBrushEnabled = this.props.chartStore!.isBrushEnabled();
    if (isBrushEnabled) {
      brushProps = {
        onMouseDown: this.onStartBrusing,
        onMouseUp: this.onEndBrushing,
        onMouseMove: this.onBrushing,
      };
    }

    const gridClippings = {
      clipX: chartDimensions.left,
      clipY: chartDimensions.top,
      clipWidth: chartDimensions.width,
      clipHeight: chartDimensions.height,
    };

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          boxSizing: 'border-box',
        }}
      >
        <Stage
          width={parentDimensions.width}
          height={parentDimensions.height}
          style={{
            width: '100%',
            height: '100%',
          }}
          {...brushProps}
        >
          <Layer hitGraphEnabled={false} {...gridClippings}>{this.renderGrids()}</Layer>

          <Layer
            ref={this.renderingLayerRef}
            x={chartDimensions.left + chartTransform.x}
            y={chartDimensions.top + chartTransform.y}
            rotation={chartRotation}
            {...clippings}
            listening={!this.state.brushing}
            onMouseMove={({ evt }) => {
              if (tooltipData != null) {
                setTooltipPosition(evt.layerX, evt.layerY);
              }
            }}
          >
            {this.renderBarSeries()}
            {this.renderAreaSeries()}
            {this.renderLineSeries()}

            {debug && this.renderDebugChartBorders()}
          </Layer>
          {isBrushEnabled && <Layer listening={false}>{this.renderBrushTool()}</Layer>}

          <Layer hitGraphEnabled={false}>{this.renderAxes()}</Layer>
        </Stage>
      </div>
    );
  }

  private renderDebugChartBorders = () => {
    const { chartDimensions, chartRotation } = this.props.chartStore!;
    return (
      <Rect
        x={0}
        y={0}
        width={[90, -90].includes(chartRotation) ? chartDimensions.height : chartDimensions.width}
        height={[90, -90].includes(chartRotation) ? chartDimensions.width : chartDimensions.height}
        stroke="red"
        strokeWidth={0.5}
        listening={false}
        dash={[2, 2]}
      />
    );
  }
}

export const ReactiveChart = inject('chartStore')(observer(Chart));
