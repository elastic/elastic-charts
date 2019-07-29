import { Group as KonvaGroup } from 'konva';
import React from 'react';
import { Group, Path } from 'react-konva';
import { animated, Spring } from 'react-spring/renderprops-konva.cjs';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { getGeometryStyle } from '../../chart_types/xy_chart/rendering/rendering';
import { SharedGeometryStyle } from '../../utils/themes/theme';
import { buildArcRenderProps } from './utils/rendering_props_utils';
import { ArcGeometry } from '../../utils/geometry';

interface ArcGeometriesDataProps {
  animated?: boolean;
  arcs: ArcGeometry[];
  sharedStyle: SharedGeometryStyle;
  highlightedLegendItem: LegendItem | null;
}
interface ArcGeometriesDataState {
  overArc?: ArcGeometry;
}
export class ArcGeometries extends React.PureComponent<ArcGeometriesDataProps, ArcGeometriesDataState> {
  static defaultProps: Partial<ArcGeometriesDataProps> = {
    animated: false,
  };
  private readonly barSeriesRef: React.RefObject<KonvaGroup> = React.createRef();
  constructor(props: ArcGeometriesDataProps) {
    super(props);
    this.barSeriesRef = React.createRef();
    this.state = {
      overArc: undefined,
    };
  }
  render() {
    return (
      <Group ref={this.barSeriesRef} key={'arc_series'}>
        {this.renderArcGeoms()}
      </Group>
    );
  }

  private renderArcGeoms = (): JSX.Element[] => {
    const { arcs, sharedStyle } = this.props;
    const arcsToRender: JSX.Element[] = [];

    arcs.forEach((glyph, i) => {
      const { arc, color, transform, geometryId, seriesArcStyle } = glyph;
      if (!seriesArcStyle.visible) {
        return;
      }
      const geometryStyle = getGeometryStyle(geometryId, this.props.highlightedLegendItem, sharedStyle);
      const key = `arc-${i}`;
      if (this.props.animated) {
        arcsToRender.push(
          <Group key={`arc-group-${i}`}>
            <Spring native from={{ arc }} to={{ arc }}>
              {(props: { arc: string }) => {
                const arcProps = buildArcRenderProps(transform, props.arc, color, seriesArcStyle, geometryStyle);
                return <animated.Path {...arcProps} key={key} />;
              }}
            </Spring>
          </Group>,
        );
      } else {
        const areaProps = buildArcRenderProps(transform, arc, color, seriesArcStyle, geometryStyle);
        console.log(areaProps);
        arcsToRender.push(<Path {...areaProps} key={key} />);
      }
    });
    return arcsToRender;
  };
}
