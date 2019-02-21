import { IAction } from 'mobx';
import React from 'react';
import { animated, Spring } from 'react-spring';
import { LegendItem } from '../../lib/series/legend';
import {
  AreaGeometry,
  GeometryValue,
  getGeometryStyle,
  PointGeometry,
} from '../../lib/series/rendering';
import { AreaSeriesStyle, SharedGeometryStyle } from '../../lib/themes/theme';
import { ElementClickListener, TooltipData } from '../../state/chart_state';

interface AreaGeometriesDataProps {
  animated?: boolean;
  areas: AreaGeometry[];
  num?: number;
  style: AreaSeriesStyle;
  sharedStyle: SharedGeometryStyle;
  onElementClick?: ElementClickListener;
  onElementOver: ((tooltip: TooltipData) => void) & IAction;
  onElementOut: (() => void) & IAction;
  highlightedLegendItem: LegendItem | null;
}
interface AreaGeometriesDataState {
  overPoint?: PointGeometry;
}
export class AreaGeometries extends React.PureComponent<
  AreaGeometriesDataProps,
  AreaGeometriesDataState
> {
  static defaultProps: Partial<AreaGeometriesDataProps> = {
    animated: false,
    num: 1,
  };
  constructor(props: AreaGeometriesDataProps) {
    super(props);
    this.state = {
      overPoint: undefined,
    };
  }
  render() {
    return (
      <g key={'area_series'}>
        {this.renderAreaGeoms()}
        {this.renderAreaPoints()}
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
  private renderAreaPoints = (): JSX.Element[] => {
    const { areas } = this.props;
    return areas.reduce(
      (acc, glyph, i) => {
        const { points } = glyph;
        return [...acc, ...this.renderPoints(points, i)];
      },
      [] as JSX.Element[],
    );
  }
  private renderPoints = (areaPoints: PointGeometry[], i: number): JSX.Element[] => {
    const { radius, stroke, strokeWidth } = this.props.style.point;
    const { overPoint } = this.state;

    return areaPoints.map((areaPoint, index) => {
      const { x, y, color, value, transform } = areaPoint;
      return (
        <g key={`point-${i}-${index}`}>
          <circle
            x={transform.x + x}
            y={y}
            radius={radius * 2.5}
            onClick={this.onElementClick(value)}
            onMouseOver={this.onOverPoint(areaPoint)}
            onMouseLeave={this.onOutPoint}
            fill={'gray'}
            opacity={overPoint === areaPoint ? 0.3 : 0}
          />
          <circle
            x={transform.x + x}
            y={y}
            radius={radius}
            strokeWidth={0}
            fill={color}
            opacity={overPoint === areaPoint ? 0.5 : 0}
          />
          <circle
            x={transform.x + x}
            y={y}
            radius={radius}
            fill={'transparent'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={overPoint === areaPoint ? 1 : 0}
          />
        </g>
      );
    });
  }

  private renderAreaGeoms = (): JSX.Element[] => {
    const { areas, sharedStyle } = this.props;
    return areas.map((glyph, i) => {
      const { area, color, transform, geometryId } = glyph;

      const geometryStyle = getGeometryStyle(
        geometryId,
        this.props.highlightedLegendItem,
        sharedStyle,
      );

      if (this.props.animated) {
        return (
          <g key={`area-group-${i}`} x={transform.x}>
            <Spring native from={{ area }} to={{ area }}>
              {(props: { area: string }) => (
                <animated.path key="area" d={props.area} fill={color} {...geometryStyle} />
              )}
            </Spring>
          </g>
        );
      } else {
        return <path key={`area-${i}`} d={area} fill={color} {...geometryStyle} />;
      }
    });
  }
}
