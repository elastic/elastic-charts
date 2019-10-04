import React from 'react';
import { connect } from 'react-redux';
import { Layer, Stage } from 'react-konva';
import { ArcGeometries } from './arc_geometries';
import { GlobalChartState, GlobalSettings } from '../../../../state/chart_state';
import { getChartDimensionsSelector } from '../../../../state/selectors/get_chart_dimensions';
import { Dimensions } from '../../../../utils/dimensions';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { Theme } from '../../../../utils/themes/theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Rotation } from 'chart_types/xy_chart/utils/specs';
import { LegendItem } from 'components/legend/legend';
import { computeGeometriesSelector } from '../../state/selectors/compute_geometries';
import { ArcGeometry } from 'utils/geometry';

interface Props {
  initialized: boolean;
  geometries: { arcs?: ArcGeometry[] };
  globalSettings: GlobalSettings;
  chartRotation: Rotation;
  chartDimensions: Dimensions;
  theme: Theme;
  isChartAnimatable: boolean;
  isChartEmpty: boolean;
  highlightedLegendItem?: LegendItem;
}
export interface ReactiveChartElementIndex {
  element: JSX.Element;
  zIndex: number;
}

class Chart extends React.Component<Props> {
  static displayName = 'ReactiveChart';
  firstRender = true;

  render() {
    console.log('Rendering main chart');
    const {
      initialized,
      globalSettings: { parentDimensions },
      chartRotation,
      chartDimensions,
      isChartEmpty,
      isChartAnimatable,
      geometries,
      theme,
      highlightedLegendItem,
    } = this.props;
    if (!initialized || chartDimensions.width === 0 || chartDimensions.height === 0) {
      return null;
    }
    if (isChartEmpty) {
      return (
        <div className="echReactiveChart_unavailable">
          <p>No data to display</p>
        </div>
      );
    }

    return (
      <Stage
        width={parentDimensions.width}
        height={parentDimensions.height}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Layer
          x={chartDimensions.left}
          y={chartDimensions.top}
          rotation={chartRotation}
          hitGraphEnabled={false}
          listening={false}
        >
          <ArcGeometries
            key={'arc-geometries'}
            animated={isChartAnimatable}
            arcs={geometries.arcs || []}
            sharedStyle={theme.sharedStyle}
            highlightedLegendItem={highlightedLegendItem}
          />
        </Layer>
      </Stage>
    );
  }
}

const mapDispatchToProps = () => ({});

const mapStateToProps = (state: GlobalChartState) => {
  if (!isInitialized(state)) {
    return {
      initialized: false,
      theme: LIGHT_THEME,
      geometries: {},
      globalSettings: state.settings,
      chartRotation: 0 as 0,
      chartDimensions: getChartDimensionsSelector(state),
      isChartAnimatable: false,
      isChartEmpty: true,
      highlightedLegendItem: undefined,
    };
  }
  return {
    initialized: state.initialized,
    theme: getChartThemeSelector(state),
    geometries: computeGeometriesSelector(state),
    globalSettings: state.settings,
    chartRotation: getChartRotationSelector(state),
    chartDimensions: getChartDimensionsSelector(state),
    isChartAnimatable: false,
    isChartEmpty: false,
  };
};

export const ReactiveChart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Chart);
