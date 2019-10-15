import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect, ReactReduxContext, Provider } from 'react-redux';
import { ContainerConfig } from 'konva';
import { Layer, Rect, Stage } from 'react-konva';
import { AreaGeometries } from './area_geometries';
import { BarGeometries } from './bar_geometries';
import { LineGeometries } from './line_geometries';
import { LineAnnotation } from './line_annotation';
import { RectAnnotation } from './rect_annotation';
import { Grid } from './grid';
import { Axes } from './axis';
import { BarValues } from './bar_values';
import { AnnotationDimensions } from '../../annotations/annotation_utils';
import { AnnotationLineProps } from '../../annotations/line_annotation_tooltip';
import { AnnotationRectProps } from '../../annotations/rect_annotation_tooltip';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';
import { computeChartTransformSelector } from '../../state/selectors/compute_chart_transform';
import { getAnnotationSpecsSelector } from '../../state/selectors/get_specs';
import { getHighlightedSeriesSelector } from '../../state/selectors/get_highlighted_series';
import { isChartEmptySelector } from '../../state/selectors/is_chart_empty';
import { isChartAnimatableSelector } from '../../state/selectors/is_chart_animatable';
import { isBrushAvailableSelector } from '../../state/selectors/is_brush_available';
import { Transform } from '../../state/utils';
import { Rotation, AnnotationSpec, isLineAnnotation, isRectAnnotation } from '../../utils/specs';
import { onChartRendered } from '../../../../state/actions/chart';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { GlobalChartState } from '../../../../state/chart_state';
import { Dimensions } from '../../../../utils/dimensions';
import { AnnotationId } from '../../../../utils/ids';
import { Theme, mergeWithDefaultAnnotationLine, mergeWithDefaultAnnotationRect } from '../../../../utils/themes/theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { computeSeriesGeometriesSelector } from '../../state/selectors/compute_series_geometries';
import { PointGeometry, BarGeometry, AreaGeometry, LineGeometry } from '../../../../utils/geometry';
import { LegendItem } from '../../../../chart_types/xy_chart/legend/legend';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';

interface Props {
  initialized: boolean;
  geometries: {
    points?: PointGeometry[];
    bars?: BarGeometry[];
    areas?: AreaGeometry[];
    lines?: LineGeometry[];
  };
  debug: boolean;
  parentDimensions: Dimensions;
  chartRotation: Rotation;
  chartDimensions: Dimensions;
  chartTransform: Transform;
  theme: Theme;
  isChartAnimatable: boolean;
  isChartEmpty: boolean;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
  isBrushAvailable: boolean;
  highlightedLegendItem?: LegendItem;
  onChartRendered: typeof onChartRendered;
}
export interface ReactiveChartElementIndex {
  element: JSX.Element;
  zIndex: number;
}

class Chart extends React.Component<Props> {
  static displayName = 'ReactiveChart';
  firstRender = true;

  componentDidUpdate() {
    if (this.props.initialized) {
      this.props.onChartRendered();
    }
  }
  renderBarSeries = (clippings: ContainerConfig): ReactiveChartElementIndex[] => {
    const { geometries, theme, isChartAnimatable, highlightedLegendItem } = this.props;
    if (!geometries) {
      return [];
    }

    const element = (
      <BarGeometries
        key={'bar-geometries'}
        animated={isChartAnimatable}
        bars={geometries.bars || []}
        sharedStyle={theme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
        clippings={clippings}
      />
    );

    return [
      {
        element,
        zIndex: 0,
      },
    ];
  };

  renderLineSeries = (clippings: ContainerConfig): ReactiveChartElementIndex[] => {
    const { geometries, theme, isChartAnimatable, highlightedLegendItem } = this.props;
    if (!geometries) {
      return [];
    }

    const element = (
      <LineGeometries
        key={'line-geometries'}
        animated={isChartAnimatable}
        lines={geometries.lines || []}
        sharedStyle={theme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
        clippings={clippings}
      />
    );

    return [
      {
        element,
        zIndex: 0,
      },
    ];
  };

  renderAreaSeries = (clippings: ContainerConfig): ReactiveChartElementIndex[] => {
    const { geometries, theme, isChartAnimatable, highlightedLegendItem } = this.props;
    if (!geometries) {
      return [];
    }
    const element = (
      <AreaGeometries
        key={'area-geometries'}
        animated={isChartAnimatable}
        areas={geometries.areas || []}
        sharedStyle={theme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
        clippings={clippings}
      />
    );

    return [
      {
        element,
        zIndex: 0,
      },
    ];
  };

  renderAnnotations = (): ReactiveChartElementIndex[] => {
    const { annotationDimensions, annotationSpecs } = this.props;
    const annotationElements: ReactiveChartElementIndex[] = [];

    annotationDimensions.forEach((annotation: AnnotationDimensions, id: AnnotationId) => {
      const spec = annotationSpecs.find((spec) => spec.id === id);

      if (!spec) {
        return;
      }

      if (isLineAnnotation(spec)) {
        const lineStyle = mergeWithDefaultAnnotationLine(spec.style);
        const element = (
          <LineAnnotation
            key={`line-annotation-group-${id}`}
            lines={annotation as AnnotationLineProps[]}
            lineStyle={lineStyle}
          />
        );
        annotationElements.push({
          element,
          zIndex: spec.zIndex || 0,
        });
      } else if (isRectAnnotation(spec)) {
        const rectStyle = mergeWithDefaultAnnotationRect(spec.style);
        const element = (
          <RectAnnotation
            key={`rect-annotation-group-${id}`}
            rects={annotation as AnnotationRectProps[]}
            rectStyle={rectStyle}
          />
        );
        annotationElements.push({
          element,
          zIndex: spec.zIndex || 0,
        });
      }
    });
    return annotationElements;
  };

  sortAndRenderElements() {
    const { chartDimensions, chartRotation } = this.props;
    const clippings = {
      clipX: 0,
      clipY: 0,
      clipWidth: [90, -90].includes(chartRotation) ? chartDimensions.height : chartDimensions.width,
      clipHeight: [90, -90].includes(chartRotation) ? chartDimensions.width : chartDimensions.height,
    };

    const bars = this.renderBarSeries(clippings);
    const areas = this.renderAreaSeries(clippings);
    const lines = this.renderLineSeries(clippings);
    const annotations: ReactiveChartElementIndex[] = this.renderAnnotations();
    return [...bars, ...areas, ...lines, ...annotations]
      .sort((elemIdxA, elemIdxB) => elemIdxA.zIndex - elemIdxB.zIndex)
      .map((elemIdx) => elemIdx.element);
  }

  render() {
    const { initialized, chartRotation, chartDimensions, isChartEmpty, debug, parentDimensions } = this.props;
    if (!initialized || chartDimensions.width === 0 || chartDimensions.height === 0) {
      return null;
    }
    const { chartTransform } = this.props;

    if (isChartEmpty) {
      return (
        <div className="echReactiveChart_unavailable">
          <p>No data to display</p>
        </div>
      );
    }
    const brushProps = {};
    return (
      <ReactReduxContext.Consumer>
        {({ store }) => {
          return (
            <Stage
              width={parentDimensions.width}
              height={parentDimensions.height}
              style={{
                width: '100%',
                height: '100%',
              }}
              {...brushProps}
            >
              <Provider store={store}>
                <Layer hitGraphEnabled={false} listening={false}>
                  <Grid />
                  <Axes />
                </Layer>
              </Provider>
              <Layer
                x={chartDimensions.left + chartTransform.x}
                y={chartDimensions.top + chartTransform.y}
                rotation={chartRotation}
                hitGraphEnabled={false}
                listening={false}
              >
                {this.sortAndRenderElements()}
              </Layer>
              <Provider store={store}>
                <Layer hitGraphEnabled={false} listening={false}>
                  <BarValues />
                </Layer>
              </Provider>
              {debug && (
                <Layer hitGraphEnabled={false} listening={false}>
                  {this.renderDebugChartBorders()}
                </Layer>
              )}
            </Stage>
          );
        }}
      </ReactReduxContext.Consumer>
    );
  }

  private renderDebugChartBorders = () => {
    const { chartDimensions } = this.props;
    return (
      <Rect
        x={chartDimensions.left}
        y={chartDimensions.top}
        width={chartDimensions.width}
        height={chartDimensions.height}
        stroke="red"
        strokeWidth={4}
        listening={false}
        dash={[4, 4]}
      />
    );
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: Props = {
  initialized: false,
  theme: LIGHT_THEME,
  geometries: {},
  debug: false,
  parentDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  chartRotation: 0 as 0,
  chartDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  chartTransform: {
    x: 0,
    y: 0,
    rotate: 0,
  },
  isChartAnimatable: false,
  isChartEmpty: true,
  annotationDimensions: new Map(),
  annotationSpecs: [],
  isBrushAvailable: false,
  highlightedLegendItem: undefined,
  onChartRendered,
};

const mapStateToProps = (state: GlobalChartState) => {
  if (!isInitialized(state)) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    theme: getChartThemeSelector(state),
    geometries: computeSeriesGeometriesSelector(state).geometries,
    parentDimensions: state.parentDimensions,
    debug: getSettingsSpecSelector(state).debug,
    chartRotation: getChartRotationSelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    chartTransform: computeChartTransformSelector(state),
    isChartAnimatable: isChartAnimatableSelector(state),
    isChartEmpty: isChartEmptySelector(state),
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    isBrushAvailable: isBrushAvailableSelector(state),
    highlightedLegendItem: getHighlightedSeriesSelector(state),
  };
};

export const ReactiveChart = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Chart);
