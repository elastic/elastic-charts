import { IAction } from 'mobx';
import React from 'react';
import { animated, Spring } from 'react-spring';
import { LegendItem } from '../../lib/series/legend';
import {
  GeometryValue,
  getGeometryStyle,
  LineGeometry,
  PointGeometry,
} from '../../lib/series/rendering';
import { LineSeriesStyle, SharedGeometryStyle } from '../../lib/themes/theme';
import { ElementClickListener, TooltipData } from '../../state/chart_state';

interface LineGeometriesDataProps {
  animated?: boolean;
  lines: LineGeometry[];
  style: LineSeriesStyle;
  sharedStyle: SharedGeometryStyle;
  onElementClick?: ElementClickListener;
  onElementOver: ((tooltip: TooltipData) => void) & IAction;
  onElementOut: (() => void) & IAction;
  highlightedLegendItem: LegendItem | null;
}
interface LineGeometriesDataState {
  overPoint?: PointGeometry;
}
export class LineGeometries extends React.PureComponent<
  LineGeometriesDataProps,
  LineGeometriesDataState
> {
  static defaultProps: Partial<LineGeometriesDataProps> = {
    animated: false,
  };
  constructor(props: LineGeometriesDataProps) {
    super(props);
    this.state = {
      overPoint: undefined,
    };
  }
  render() {
    return (
      <g key={'area_series'}>
        {this.renderLineGeoms()}
        {this.renderLinePoints()}
      </g>
    );
  }
  private onElementClick = (value: GeometryValue) => () => {
    if (this.props.onElementClick) {
      this.props.onElementClick(value);
    }
  }
  private onOverPoint = (point: PointGeometry) => () => {
    const { onElementOver } = this.props;
    const { x, y, value, transform } = point;
    this.setState(() => {
      return {
        overPoint: point,
      };
    });
    onElementOver({
      value,
      position: {
        left: transform.x + x,
        top: y,
      },
    });
  }
  private onOutPoint = () => {
    const { onElementOut } = this.props;

    this.setState(() => {
      return {
        overPoint: undefined,
      };
    });
    onElementOut();
  }
  private renderLinePoints = (): JSX.Element[] => {
    const { lines } = this.props;
    return lines.reduce(
      (acc, glyph, i) => {
        const { points } = glyph;
        return [...acc, ...this.renderPoints(points, i)];
      },
      [] as JSX.Element[],
    );
  }
  private renderPoints = (points: PointGeometry[], i: number): JSX.Element[] => {
    const { radius, stroke, strokeWidth } = this.props.style.point;
    const { overPoint } = this.state;

    return points.map((point, index) => {
      const { x, y, color, value, transform } = point;
      return (
        <g key={`point-${i}-${index}`}>
          <circle
            x={transform.x + x}
            y={y}
            radius={radius * 2.5}
            onClick={this.onElementClick(value)}
            onMouseOver={this.onOverPoint(point)}
            onMouseLeave={this.onOutPoint}
            fill={'gray'}
            opacity={overPoint === point ? 0.3 : 0}
          />
          <circle
            x={transform.x + x}
            y={y}
            radius={radius}
            strokeWidth={0}
            fill={color}
            opacity={overPoint === point ? 0.5 : 0}
          />
          <circle
            x={transform.x + x}
            y={y}
            radius={radius}
            fill={'transparent'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={overPoint === point ? 1 : 0}
          />
        </g>
      );
    });
  }

  private renderLineGeoms = (): JSX.Element[] => {
    const { style, lines, sharedStyle } = this.props;
    const { strokeWidth } = style.line;
    return lines.map((glyph, i) => {
      const { line, color, transform, geometryId } = glyph;

      const geometryStyle = getGeometryStyle(
        geometryId,
        this.props.highlightedLegendItem,
        sharedStyle,
      );

      if (this.props.animated) {
        return (
          <g key={i} x={transform.x}>
            <Spring native from={{ line }} to={{ line }}>
              {(props: { line: string }) => (
                <animated.path
                  key="line"
                  d={props.line}
                  strokeWidth={strokeWidth}
                  stroke={color}
                  stroke-lineCap="round"
                  stroke-linejoin="round"
                  fill={'none'}
                  {...geometryStyle}
                />
              )}
            </Spring>
          </g>
        );
      } else {
        return (
          <path
            key="line"
            d={line}
            strokeWidth={strokeWidth}
            stroke={color}
            stroke-linecap="round"
            stroke-linejoin="round"
            fill={'none'}
            {...geometryStyle}
          />
        );
      }
    });
  }
}
