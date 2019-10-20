import { Group as KonvaGroup, ContainerConfig } from 'konva';
import React from 'react';
import { Group, Arc } from 'react-konva';
import { animated, Spring } from 'react-spring/renderprops-konva.cjs';
import { buildSectorRenderProps, buildSectorBorderRenderProps } from './utils/rendering_props_utils';
import { getGeometryStyle } from '../../rendering/rendering';
import { SectorGeometry } from '../../../../utils/geometry';
import { SharedGeometryStyle } from '../../../../utils/themes/theme';
import { LegendItem } from '../../../../chart_types/xy_chart/legend/legend';

interface SectorGeometriesDataProps {
  animated?: boolean;
  sectors: SectorGeometry[];
  sharedStyle: SharedGeometryStyle;
  highlightedLegendItem: LegendItem | null;
  clippings: ContainerConfig;
}
interface SectorGeometriesDataState {
  overSector?: SectorGeometry;
}
export class SectorGeometries extends React.PureComponent<SectorGeometriesDataProps, SectorGeometriesDataState> {
  static defaultProps: Partial<SectorGeometriesDataProps> = {
    animated: false,
  };
  private readonly sectorSeriesRef: React.RefObject<KonvaGroup> = React.createRef();
  constructor(props: SectorGeometriesDataProps) {
    super(props);
    this.sectorSeriesRef = React.createRef();
    this.state = {
      overSector: undefined,
    };
  }
  render() {
    const { sectors, clippings } = this.props;
    // todo extract out and centralize string constants like 'sector_series'
    return (
      <Group ref={this.sectorSeriesRef} key={'sector_series'} {...clippings}>
        {this.renderSectorGeoms(sectors)}
      </Group>
    );
  }

  private renderSectorGeoms = (sectors: SectorGeometry[]): JSX.Element[] => {
    // here we still have access to original data `values` such as a semi-original y value (adding up to 1 when %)
    // but we already have computed screenspace values for y in eg. geometries.sectors[0].y
    console.log('In private renderSectorGeoms:', (sectors || []).reduce((p, sector) => p + sector.value.y, 0));

    const { overSector } = this.state;
    const { sharedStyle } = this.props;
    return sectors.map((sector, index) => {
      const { x, y, width, height, color, seriesStyle, angle, rotation } = sector;

      // Properties to determine if we need to highlight individual sectors depending on hover state
      const hasGeometryHover = overSector != null;
      const hasHighlight = overSector === sector;
      const individualHighlight = {
        hasGeometryHover,
        hasHighlight,
      };

      const geometryStyle = getGeometryStyle(
        sector.geometryId,
        this.props.highlightedLegendItem,
        sharedStyle,
        individualHighlight,
      );
      const key = `sector-${index}`; // todo the prefix string should come from some metadata

      if (this.props.animated) {
        return (
          <Group key={index}>
            <Spring
              native
              from={{ y: y + height, height: 0, angle: 0, rotation: 0 }}
              to={{ y, height, angle, rotation }}
            >
              {(props: { y: number; height: number; angle: number; rotation: number }) => {
                // todo why do we need to spell out properties, instead of referring to the SectorGeometry type?
                const sectorPropsBorder = buildSectorBorderRenderProps(
                  x,
                  props.y,
                  width,
                  props.height,
                  props.angle,
                  props.rotation,
                  seriesStyle.rect,
                  seriesStyle.rectBorder,
                  geometryStyle,
                );
                const sectorProps = buildSectorRenderProps(
                  x,
                  props.y,
                  width,
                  props.height,
                  props.angle,
                  props.rotation,
                  color,
                  seriesStyle.rect,
                  seriesStyle.rectBorder,
                  geometryStyle,
                );

                return (
                  <React.Fragment key={key}>
                    <animated.Arc {...sectorProps} />
                    {sectorPropsBorder && <animated.Arc {...sectorPropsBorder} />}
                  </React.Fragment>
                );
              }}
            </Spring>
          </Group>
        );
      } else {
        const sectorPropsBorder = buildSectorBorderRenderProps(
          x,
          y,
          width,
          height,
          angle,
          rotation,
          seriesStyle.rect,
          seriesStyle.rectBorder,
          geometryStyle,
        );
        const sectorProps = buildSectorRenderProps(
          x,
          y,
          width,
          height,
          angle,
          rotation,
          color,
          seriesStyle.rect,
          seriesStyle.rectBorder,
          geometryStyle,
        );

        return (
          <React.Fragment key={key}>
            <Arc {...sectorProps} />
            {sectorPropsBorder && <Arc {...sectorPropsBorder} />}
          </React.Fragment>
        );
      }
    });
  };
}
