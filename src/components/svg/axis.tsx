import React from 'react';
import {
  AxisTick,
  AxisTicksDimensions,
  centerRotationOrigin,
  getHorizontalAxisTickLineProps,
  getTickLabelProps,
  getVerticalAxisTickLineProps,
  isHorizontal,
  isVertical,
} from '../../lib/axes/axis_utils';
import { AxisSpec, Position } from '../../lib/series/specs';
import { Theme } from '../../lib/themes/theme';
import { Dimensions } from '../../lib/utils/dimensions';

interface AxisProps {
  chartTheme: Theme;
  axisSpec: AxisSpec;
  axisTicksDimensions: AxisTicksDimensions;
  axisPosition: Dimensions;
  ticks: AxisTick[];
  debug: boolean;
  chartDimensions: Dimensions;
}

export class Axis extends React.PureComponent<AxisProps> {
  render() {
    return this.renderAxis();
  }
  renderTickLabel = (tick: AxisTick, i: number) => {
    const { padding, ...labelStyle } = this.props.chartTheme.axes.tickLabelStyle;
    const {
      axisSpec: { tickSize, tickPadding, position },
      axisTicksDimensions,
      debug,
    } = this.props;

    const tickLabelRotation = this.props.axisSpec.tickLabelRotation || 0;

    const tickLabelProps = getTickLabelProps(
      tickLabelRotation,
      tickSize,
      tickPadding,
      tick.position,
      position,
      axisTicksDimensions,
    );

    const { maxLabelTextWidth, maxLabelTextHeight } = axisTicksDimensions;
    const centeredRectProps = centerRotationOrigin(axisTicksDimensions, {
      x: tickLabelProps.x,
      y: tickLabelProps.y,
    });
    const { align, verticalAlign, ...tickLabelRestProps } = tickLabelProps;
    const textProps = {
      width: maxLabelTextWidth,
      height: maxLabelTextHeight,
      transform: `rotate(${tickLabelRotation} ${tickLabelRestProps.x} ${tickLabelRestProps.y})`,
      // ...tickLabelRestProps,
      x: centeredRectProps.x,
      y: centeredRectProps.y,
      // dx: centeredRectProps.offsetX,
      // dy: centeredRectProps.offsetY,
    };

    return (
      <g key={`tick-${i}`}>
        {debug && <rect {...textProps} stroke="black" strokeWidth={1} fill="violet" />}
        <text {...textProps} {...labelStyle}>
          {tick.label}
        </text>
      </g>
    );
  }

  private renderTickLine = (tick: AxisTick, i: number) => {
    const {
      axisSpec: { tickSize, tickPadding, position },
      axisTicksDimensions: { maxLabelBboxHeight },
      chartTheme: {
        axes: { tickLineStyle },
      },
    } = this.props;

    const lineProps = isVertical(position)
      ? getVerticalAxisTickLineProps(position, tickPadding, tickSize, tick.position)
      : getHorizontalAxisTickLineProps(
          position,
          tickPadding,
          tickSize,
          tick.position,
          maxLabelBboxHeight,
        );

    return (
      <line
        key={`tick-${i}`}
        x1={lineProps[0]}
        y1={lineProps[1]}
        x2={lineProps[2]}
        y2={lineProps[3]}
        {...tickLineStyle}
      />
    );
  }
  private renderAxis = () => {
    const { ticks, axisPosition } = this.props;
    return (
      <g transform={`translate(${axisPosition.left} ${axisPosition.top})`}>
        <g key="lines">{this.renderAxisLine()}</g>
        <g key="tick-lines">{ticks.map(this.renderTickLine)}</g>
        <g key="ticks">{ticks.filter((tick) => tick.label !== null).map(this.renderTickLabel)}</g>
        {this.renderAxisTitle()}
      </g>
    );
  }
  private renderAxisLine = () => {
    const {
      axisSpec: { tickSize, tickPadding, position },
      axisPosition,
      axisTicksDimensions,
      chartTheme: {
        axes: { axisLineStyle },
      },
    } = this.props;
    const lineProps: number[] = [];
    if (isVertical(position)) {
      lineProps[0] = position === Position.Left ? tickSize + tickPadding : 0;
      lineProps[2] = position === Position.Left ? tickSize + tickPadding : 0;
      lineProps[1] = 0;
      lineProps[3] = axisPosition.height;
    } else {
      lineProps[0] = 0;
      lineProps[2] = axisPosition.width;
      lineProps[1] =
        position === Position.Top
          ? axisTicksDimensions.maxLabelBboxHeight + tickSize + tickPadding
          : 0;
      lineProps[3] =
        position === Position.Top
          ? axisTicksDimensions.maxLabelBboxHeight + tickSize + tickPadding
          : 0;
    }
    return (
      <line
        x1={lineProps[0]}
        y1={lineProps[1]}
        x2={lineProps[2]}
        y2={lineProps[3]}
        {...axisLineStyle}
      />
    );
  }
  private renderAxisTitle() {
    const {
      axisSpec: { title, position },
    } = this.props;
    if (!title) {
      return null;
    }
    if (isHorizontal(position)) {
      return this.renderHorizontalAxisTitle();
    }
    return this.renderVerticalAxisTitle();
  }
  private renderVerticalAxisTitle() {
    const {
      axisPosition: { height },
      axisSpec: { title, position, tickSize, tickPadding },
      axisTicksDimensions: { maxLabelBboxWidth },
      chartTheme: {
        axes: { axisTitleStyle },
      },
      debug,
    } = this.props;
    if (!title) {
      return null;
    }
    const { padding, ...titleStyle } = axisTitleStyle;
    const top = height;
    const left =
      position === Position.Left
        ? -(maxLabelBboxWidth + titleStyle.fontSize + padding)
        : tickSize + tickPadding + maxLabelBboxWidth + padding;

    return (
      <g>
        {debug && (
          <rect
            x={left}
            y={top}
            width={height}
            height={titleStyle.fontSize}
            fill="violet"
            stroke="black"
            strokeWidth={1}
            transform={`rotate(-90 ${left} ${top})`}
          />
        )}
        <text
          dx={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          x={left}
          y={top}
          width={height}
          transform={`rotate(-90 ${left} ${top})`}
          {...titleStyle}
        >
          {title}
        </text>
      </g>
    );
  }
  private renderHorizontalAxisTitle() {
    const {
      axisPosition: { width, height },
      axisSpec: { title, position, tickSize, tickPadding },
      axisTicksDimensions: { maxLabelBboxHeight },
      chartTheme: {
        axes: {
          axisTitleStyle: { padding, ...titleStyle },
        },
      },
      debug,
    } = this.props;

    if (!title) {
      return;
    }

    const top =
      position === Position.Top
        ? -maxLabelBboxHeight - padding
        : maxLabelBboxHeight + tickPadding + tickSize + padding;

    const left = 0;
    return (
      <g>
        {debug && (
          <rect
            x={left}
            y={top}
            width={width}
            height={titleStyle.fontSize}
            stroke="black"
            strokeWidth={1}
            fill="violet"
          />
        )}
        <text
          dx={width / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          x={left}
          y={top}
          width={width}
          height={height}
          {...titleStyle}
        >
          {title}
        </text>
      </g>
    );
  }
}
