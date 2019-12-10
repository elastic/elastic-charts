import React, { RefObject } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Group, Layer, Line, Path, Stage, Text } from 'react-konva';
import { onChartRendered } from '../../../../state/actions/chart';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { GlobalChartState } from '../../../../state/chart_state';
import { Dimensions } from '../../../../utils/dimensions';
import { Theme } from '../../../../utils/themes/theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { computeGeometriesSelector } from '../../state/selectors/compute_geometries';
import { ShapeViewModel } from '../../layout/circline/types/ViewModelTypes';
import { config } from '../../layout/circline/config/config';
import { tau } from '../../layout/circline/utils/math';
import { renderSunburstCanvas2d } from './canvasRenderers';

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  chartContainerDimensions: Dimensions;
  theme: Theme;
}
interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}
interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<Stage>;
}
interface ReactiveChartElementIndex {
  element: JSX.Element;
  zIndex: number;
}

const renderSunburst = (geometries: ShapeViewModel) => {
  const shapeViewModel = geometries;
  const config = shapeViewModel.config;
  return (
    <Group x={shapeViewModel.diskCenter.x} y={shapeViewModel.diskCenter.y}>
      <Group>
        {shapeViewModel.sectorViewModel.map(({ strokeWidth, fillColor, arcPath }, i) => {
          return <Path key={i} data={arcPath} fill={fillColor} stroke={'white'} strokeWidth={strokeWidth} />;
        })}
      </Group>
      <Group>
        {shapeViewModel.rowSets.map(
          ({ rows, rotation, fontFamily, fontSize, fillTextColor, fontStyle /*, fillTextWeight, fontVariant*/ }, i) => {
            return (
              <Group key={i}>
                {rows.map((currentRow, i) => {
                  const crx = currentRow.rowCentroidX - (Math.cos(rotation) * currentRow.length) / 2;
                  const cry = -currentRow.rowCentroidY + (Math.sin(rotation) * currentRow.length) / 2;
                  return (
                    <Group key={i} x={crx} y={cry} rotation={(-rotation / tau) * 360}>
                      {currentRow.rowWords.map(({ text, wordBeginning, verticalOffset }, i) => {
                        return (
                          <Text
                            key={i}
                            text={text}
                            x={wordBeginning}
                            y={verticalOffset}
                            fontSize={fontSize}
                            fontFamily={fontFamily}
                            fontStyle={fontStyle}
                            /*fontWeight={fillTextWeight}*/
                            /*fontVariant={fontVariant}*/
                            fill={fillTextColor}
                            rotation={0}
                          />
                        );
                      })}
                    </Group>
                  );
                })}
              </Group>
            );
          },
        )}
      </Group>
      <Group>
        {shapeViewModel.linkLabelViewModels.map(
          ({ link, text, translate: [x, y], textAlign, width, verticalOffset }, i) => {
            return (
              <Group key={i}>
                <Group scaleY={-1}>
                  <Line
                    points={([] as number[]).concat(...link)}
                    stroke={config.linkLabel.textColor}
                    strokeWidth={config.linkLabel.lineWidth}
                  />
                </Group>
                <Group>
                  <Text
                    text={text}
                    x={x - width * { start: 0, left: 0, center: 0.5, right: 1, end: 1 }[textAlign]}
                    y={-y + verticalOffset}
                    width={width}
                    wrap={'none'}
                    strokeEnabled={false}
                    fontSize={config.linkLabel.fontSize}
                    fontFamily={config.fontFamily}
                  />
                </Group>
              </Group>
            );
          },
        )}
      </Group>
    </Group>
  );
};

const canvasFrag = (width: number, height: number, dpi: number, canvasRef: React.RefObject<HTMLCanvasElement>) => (
  <canvas
    ref={canvasRef}
    width={width * dpi}
    height={height * dpi}
    style={{
      padding: 0,
      margin: 0,
      border: 0,
      background: 'transparent',
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height,
    }}
  />
);

const konvaFrag = (width: number, height: number, geometries: ShapeViewModel, forwardStageRef: RefObject<Stage>) => (
  <Stage
    width={width}
    height={height}
    ref={forwardStageRef}
    style={{
      width: '100%',
      height: '100%',
    }}
  >
    <Layer hitGraphEnabled={false} listening={false}>
      {renderSunburst(geometries)}
    </Layer>
  </Stage>
);

const nativeCanvas2d = false;

const renderFrag = (
  width: number,
  height: number,
  dpi: number,
  geometries: ShapeViewModel,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  forwardStageRef: RefObject<Stage>,
) =>
  nativeCanvas2d ? canvasFrag(width, height, dpi, canvasRef) : konvaFrag(width, height, geometries, forwardStageRef);

const canvasRender = (
  ctx: CanvasRenderingContext2D,
  devicePixelRatio: number,
  { width, height }: Dimensions,
  shapeViewModel: ShapeViewModel,
) => {
  renderSunburstCanvas2d(ctx, devicePixelRatio, {
    ...shapeViewModel,
    config: { ...shapeViewModel.config, width, height },
  });
};

type SunburstProps = ReactiveChartOwnProps & ReactiveChartStateProps & ReactiveChartDispatchProps;
class SunburstComponent extends React.Component<SunburstProps> {
  static displayName = 'Sunburst';
  firstRender = true; // this'll be useful for stable resizing of treemaps
  private readonly canvasRef: React.RefObject<HTMLCanvasElement>;
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions
  constructor(props: Readonly<SunburstProps>) {
    super(props);
    this.canvasRef = React.createRef();
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidUpdate() {
    if (this.props.initialized) {
      this.props.onChartRendered();
    }
  }

  componentDidMount() {
    // the DOM element has just been appended, and getContext('2d') is always non-null,
    // so we could use a couple of ! non-null assertions but no big plus
    if (nativeCanvas2d) {
      const canvas = this.canvasRef.current;
      const ctx = canvas && canvas.getContext('2d');
      if (ctx) {
        canvasRender(ctx, this.devicePixelRatio, this.props.chartContainerDimensions, this.props.geometries);
      }
    }
  }

  render() {
    const { initialized, chartContainerDimensions } = this.props;
    if (!initialized || chartContainerDimensions.width === 0 || chartContainerDimensions.height === 0) {
      return null;
    }

    return renderFrag(
      chartContainerDimensions.width,
      chartContainerDimensions.height,
      this.devicePixelRatio,
      this.props.geometries,
      this.canvasRef,
      this.props.forwardStageRef,
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

export const nullSectorViewModel = (): ShapeViewModel => ({
  config,
  sectorViewModel: [],
  rowSets: [],
  linkLabelViewModels: [],
  outsideLinksViewModel: [],
  diskCenter: { x: 0, y: 0 },
});

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  theme: LIGHT_THEME,
  geometries: nullSectorViewModel(),
  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (!isInitialized(state)) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    theme: getChartThemeSelector(state),
    geometries: computeGeometriesSelector(state),
    chartContainerDimensions: state.parentDimensions,
  };
};

export const Sunburst = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SunburstComponent);
