import React, { RefObject } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Layer, Stage, Path, Group } from 'react-konva';
import { onChartRendered } from '../../../../state/actions/chart';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { GlobalChartState } from '../../../../state/chart_state';
import { Dimensions } from '../../../../utils/dimensions';
import { Theme } from '../../../../utils/themes/theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { ArcGeometry } from '../../../../utils/geometry';
import { computeGeometriesSelector } from '../../state/selectors/compute_geometries';

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: { arcs: ArcGeometry[] };
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
  renderSunburst = () => (
    <Group>
      {this.props.geometries.arcs.map((arc, i) => {
        return <Path key={i} data={arc.arc} fill={arc.color} x={arc.transform.x} y={arc.transform.y} />;
      })}
    </Group>
  );

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

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  theme: LIGHT_THEME,
  geometries: {
    arcs: [],
  },
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
