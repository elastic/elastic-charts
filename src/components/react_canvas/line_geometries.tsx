import { Group as KonvaGroup } from 'konva';
import React from 'react';
import { Circle, Group, Path } from 'react-konva';
import { animated, Spring } from 'react-spring/renderprops-konva.cjs';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { getGeometryStyle, LineGeometry, PointGeometry } from '../../chart_types/xy_chart/rendering/rendering';
import { SharedGeometryStyle } from '../../utils/themes/theme';
import {
  buildLineRenderProps,
  buildPointStyleProps,
  PointStyleProps,
  buildPointRenderProps,
} from './utils/rendering_props_utils';

interface LineGeometriesDataProps {
  animated?: boolean;
  lines: LineGeometry[];
  sharedStyle: SharedGeometryStyle;
  highlightedLegendItem: LegendItem | null;
}
interface LineGeometriesDataState {
  overPoint?: PointGeometry;
}
export class LineGeometries extends React.PureComponent<LineGeometriesDataProps, LineGeometriesDataState> {
  static defaultProps: Partial<LineGeometriesDataProps> = {
    animated: false,
  };
  private readonly barSeriesRef: React.RefObject<KonvaGroup> = React.createRef();
  constructor(props: LineGeometriesDataProps) {
    super(props);
    this.barSeriesRef = React.createRef();
    this.state = {
      overPoint: undefined,
    };
  }

  render() {
    return (
      <Group ref={this.barSeriesRef} key={'bar_series'}>
        {this.renderLineGeoms()}
      </Group>
    );
  }

  private renderPoints = (
    linePoints: PointGeometry[],
    lineIndex: number,
    pointStyleProps: PointStyleProps,
  ): JSX.Element[] => {
    const linePointsElements: JSX.Element[] = [];
    linePoints.forEach((linePoint, pointIndex) => {
      const { x, y, transform } = linePoint;
      const key = `line-point-${lineIndex}-${pointIndex}`;
      if (this.props.animated) {
        linePointsElements.push(
          <Group key={`line-point-group-${lineIndex}-${pointIndex}`} x={transform.x}>
            <Spring native from={{ y }} to={{ y }}>
              {() => {
                const pointProps = buildPointRenderProps(x, y, pointStyleProps);
                return <animated.Circle {...pointProps} key={key} />;
              }}
            </Spring>
          </Group>,
        );
      } else {
        const pointProps = buildPointRenderProps(transform.x + x, y, pointStyleProps);
        linePointsElements.push(<Circle {...pointProps} key={key} />);
      }
    });
    return linePointsElements;
  };

  private renderLineGeoms = (): JSX.Element[] => {
    const { lines, sharedStyle } = this.props;

    return lines.reduce<JSX.Element[]>((acc, glyph, index) => {
      const { seriesLineStyle, seriesPointStyle } = glyph;

      if (seriesLineStyle.visible) {
        acc.push(this.getLineToRender(glyph, sharedStyle, index));
      }

      if (seriesPointStyle.visible) {
        acc.push(...this.getPointToRender(glyph, index));
      }
      return acc;
    }, []);
  };

  getLineToRender(glyph: LineGeometry, sharedStyle: SharedGeometryStyle, index: number) {
    const { line, color, transform, geometryId, seriesLineStyle } = glyph;
    const key = `line-${index}`;
    const customOpacity = seriesLineStyle ? seriesLineStyle.opacity : undefined;
    const geometryStyle = getGeometryStyle(geometryId, this.props.highlightedLegendItem, sharedStyle, customOpacity);

    if (this.props.animated) {
      return (
        <Group key={index} x={transform.x}>
          <Spring native reset from={{ opacity: 0 }} to={{ opacity: 1 }}>
            {() => {
              const lineProps = buildLineRenderProps(0, line, color, seriesLineStyle, geometryStyle);
              return <animated.Path {...lineProps} key={key} />;
            }}
          </Spring>
        </Group>
      );
    } else {
      const lineProps = buildLineRenderProps(transform.x, line, color, seriesLineStyle, geometryStyle);
      return <Path {...lineProps} key={key} />;
    }
  }

  getPointToRender(glyph: LineGeometry, index: number) {
    const { points, color, seriesPointStyle } = glyph;

    const pointStyleProps = buildPointStyleProps(color, seriesPointStyle);
    return this.renderPoints(points, index, pointStyleProps);
  }
}
