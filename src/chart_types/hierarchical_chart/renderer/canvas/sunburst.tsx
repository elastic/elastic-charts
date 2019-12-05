import React, { RefObject } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Layer, Stage, Path, Line, Group, Text } from 'react-konva';
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

type SunburstProps = ReactiveChartOwnProps & ReactiveChartStateProps & ReactiveChartDispatchProps;
class SunburstComponent extends React.Component<SunburstProps> {
  static displayName = 'Sunburst';
  firstRender = true;

  componentDidUpdate() {
    if (this.props.initialized) {
      this.props.onChartRendered();
    }
  }
  renderSunburst = () => {
    const shapeViewModel = this.props.geometries;
    return (
      <Group x={shapeViewModel.diskCenter.x} y={shapeViewModel.diskCenter.y}>
        <Group>
          {shapeViewModel.sectorViewModel.map(({ strokeWidth, fillColor, arcPath }, i) => {
            return <Path key={i} data={arcPath} fill={fillColor} stroke={'white'} strokeWidth={strokeWidth} />;
          })}
        </Group>
        <Group>
          {shapeViewModel.rowSets.map(
            (
              { rows, rotation, fontFamily, fontSize, fillTextColor, fontStyle /*, fillTextWeight, fontVariant*/ },
              i,
            ) => {
              return (
                <Group key={i}>
                  {rows.map((currentRow, i) => {
                    const crx = currentRow.rowCentroidX - (Math.cos(rotation) * currentRow.length) / 2;
                    const cry = -currentRow.rowCentroidY + (Math.sin(rotation) * currentRow.length) / 2;
                    return (
                      <Group key={i} x={crx} y={cry - 10} rotation={(-rotation / tau) * 360}>
                        {currentRow.rowWords.map(({ text, width, wordBeginning }, i) => {
                          return (
                            <Text
                              key={i}
                              text={text}
                              x={wordBeginning}
                              y={2}
                              fontSize={fontSize}
                              fontFamily={fontFamily}
                              fontStyle={fontStyle}
                              /*fontWeight={fillTextWeight}*/
                              /*fontVariant={fontVariant}*/
                              align={'center'}
                              width={width}
                              verticalAlign={'middle'}
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
          {shapeViewModel.linkLabelViewModels.map(({ link, translate: [x, y] /*, textAlign, text */ }, i) => {
            return (
              <Group key={i} x={x} y={y}>
                <Line points={([] as number[]).concat(...link)} stroke={'black'} strokeWidth={100} />
              </Group>
            );
          })}
        </Group>
      </Group>
    );
  };

  render() {
    const { initialized, chartContainerDimensions } = this.props;
    if (!initialized || chartContainerDimensions.width === 0 || chartContainerDimensions.height === 0) {
      return null;
    }

    return (
      <Stage
        width={chartContainerDimensions.width}
        height={chartContainerDimensions.height}
        ref={this.props.forwardStageRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Layer hitGraphEnabled={false} listening={false}>
          {this.renderSunburst()}
        </Layer>
      </Stage>
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
