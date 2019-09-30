import React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { ContainerConfig } from 'konva';
import { AreaGeometries } from './area_geometries';
import { ArcGeometries } from './arc_geometries';
import { BarGeometries } from './bar_geometries';
import { LineGeometries } from './line_geometries';
import { IChartState, GeometriesList, GlobalSettings } from '../../store/chart_store';
import { connect } from 'react-redux';
import { getRenderedGeometriesSelector } from '../../store/selectors/get_rendered_geometries';
import { getChartDimensionsSelector } from '../../store/selectors/get_chart_dimensions';
import { Dimensions } from '../../utils/dimensions';
import { isChartAnimatableSelector } from '../../chart_types/xy_chart/store/selectors/is_chart_animatable';
import { isInitialized } from '../../store/selectors/is_initialized';
import { getChartRotationSelector } from '../../store/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../store/selectors/get_chart_theme';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import { computeChartTransformSelector } from '../../chart_types/xy_chart/store/selectors/compute_chart_transform';
import { Transform } from '../../chart_types/xy_chart/store/utils';
import { Rotation, AnnotationSpec } from '../../chart_types/xy_chart/utils/specs';
import { AnnotationId } from '../../utils/ids';
import { isLineAnnotation, isRectAnnotation } from '../../chart_types/xy_chart/utils/specs';
import {
  AnnotationDimensions,
  AnnotationLineProps,
  AnnotationRectProps,
} from '../../chart_types/xy_chart/annotations/annotation_utils';
import { LineAnnotation } from '../../chart_types/xy_chart/renderer/canvas/line_annotation';
import { RectAnnotation } from '../../chart_types/xy_chart/renderer/canvas/rect_annotation';
import { computeAnnotationDimensionsSelector } from '../../chart_types/xy_chart/store/selectors/compute_annotations';
import { getAnnotationSpecsSelector } from '../../chart_types/xy_chart/store/selectors/get_specs';
import { isChartEmptySelector } from '../../chart_types/xy_chart/store/selectors/is_chart_empty';
import { isBrushAvailableSelector } from '../../chart_types/xy_chart/store/selectors/is_brush_available';
import { getHighlightedSeriesSelector } from '../../chart_types/xy_chart/store/selectors/get_highlighted_series';
import { LegendItem } from '../../chart_types/xy_chart/legend/legend';
import { RectAnnotationStyle, LineAnnotationStyle, Theme } from '../../utils/themes/theme';

interface Props {
  initialized: boolean;
  geometries: GeometriesList;
  globalSettings: GlobalSettings;
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
}
export interface ReactiveChartElementIndex {
  element: JSX.Element;
  zIndex: number;
}

class Chart extends React.Component<Props> {
  static displayName = 'ReactiveChart';
  firstRender = true;

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

  // getAxes = (): AxisProps[] => {
  //   const { axesVisibleTicks, axesSpecs, axesTicksDimensions, axesPositions } = this.props.chartStore!;
  //   const ids = [...axesVisibleTicks.keys()];

  //   return ids
  //     .map((id) => ({
  //       key: `axis-${id}`,
  //       ticks: axesVisibleTicks.get(id),
  //       axisSpec: axesSpecs.get(id),
  //       axisTicksDimensions: axesTicksDimensions.get(id),
  //       axisPosition: axesPositions.get(id),
  //     }))
  //     .filter(
  //       (config: Partial<AxisProps>): config is AxisProps => {
  //         const { ticks, axisSpec, axisTicksDimensions, axisPosition } = config;

  //         return Boolean(ticks && axisSpec && axisTicksDimensions && axisPosition);
  //       },
  //     );
  // };

  // renderAxes = (): JSX.Element[] => {
  //   const { chartTheme, debug, chartDimensions } = this.props.chartStore!;
  //   const axes = this.getAxes();

  //   return axes.map(({ key, ...axisProps }) => (
  //     <Axis {...axisProps} key={key} chartTheme={chartTheme} debug={debug} chartDimensions={chartDimensions} />
  //   ));
  // };

  renderArcSeries = (): ReactiveChartElementIndex[] => {
    const { geometries, theme, isChartAnimatable, highlightedLegendItem } = this.props;
    if (!geometries) {
      return [];
    }
    const element = (
      <ArcGeometries
        key={'arc-geometries'}
        animated={isChartAnimatable}
        arcs={geometries.arcs || []}
        sharedStyle={theme.sharedStyle}
        highlightedLegendItem={highlightedLegendItem}
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
    const {
      annotationDimensions,
      annotationSpecs,
      chartDimensions,
      globalSettings: { debug },
    } = this.props;
    console.log({ annotationDimensions, annotationSpecs });
    const annotationElements: ReactiveChartElementIndex[] = [];
    annotationDimensions.forEach((annotation: AnnotationDimensions, id: AnnotationId) => {
      const spec = annotationSpecs.find((spec) => spec.id === id);

      if (!spec) {
        return;
      }

      const zIndex = spec.zIndex || 0;
      let element;
      console.log({ spec });
      if (isLineAnnotation(spec)) {
        console.log({ lineAnnotatio: spec });
        const lineStyle = spec.style as LineAnnotationStyle;

        element = (
          <LineAnnotation
            key={`annotation-${id}`}
            chartDimensions={chartDimensions}
            debug={debug}
            lines={annotation as AnnotationLineProps[]}
            lineStyle={lineStyle}
          />
        );
      } else if (isRectAnnotation(spec)) {
        console.log('is rect annotation');
        const rectStyle = spec.style as RectAnnotationStyle;

        element = (
          <RectAnnotation
            key={`annotation-${id}`}
            chartDimensions={chartDimensions}
            debug={debug}
            rects={annotation as AnnotationRectProps[]}
            rectStyle={rectStyle}
          />
        );
      }

      if (element) {
        annotationElements.push({
          element,
          zIndex,
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
    const arcs = this.renderArcSeries();
    const annotations = this.renderAnnotations();

    return [...bars, ...areas, ...lines, ...arcs, ...annotations]
      .sort((elemIdxA, elemIdxB) => elemIdxA.zIndex - elemIdxB.zIndex)
      .map((elemIdx) => elemIdx.element);
  }

  render() {
    console.log('Rendering main chart');
    const { initialized, globalSettings, chartRotation, chartDimensions, isChartEmpty } = this.props;
    if (!initialized) {
      return null;
    }

    const { debug, parentDimensions } = globalSettings;
    const { chartTransform } = this.props;

    if (isChartEmpty) {
      return (
        <div className="echReactiveChart_unavailable">
          <p>No data to display</p>
        </div>
      );
    }

    const brushProps = {};

    const childComponents = React.Children.toArray(this.props.children);
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
        {childComponents && childComponents[0] ? childComponents[0] : null}

        <Layer
          x={chartDimensions.left + chartTransform.x}
          y={chartDimensions.top + chartTransform.y}
          rotation={chartRotation}
          hitGraphEnabled={false}
          listening={false}
        >
          {this.sortAndRenderElements()}
        </Layer>

        {debug && (
          <Layer hitGraphEnabled={false} listening={false}>
            {this.renderDebugChartBorders()}
          </Layer>
        )}

        {childComponents && childComponents[1] ? childComponents[1] : null}
      </Stage>
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

const mapDispatchToProps = () => ({});

const mapStateToProps = (state: IChartState) => {
  if (!isInitialized(state)) {
    return {
      initialized: false,
      theme: LIGHT_THEME,
      geometries: {},
      globalSettings: state.settings,
      chartRotation: 0 as 0,
      chartDimensions: getChartDimensionsSelector(state),
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
    };
  }
  return {
    initialized: state.initialized,
    theme: getChartThemeSelector(state),
    geometries: getRenderedGeometriesSelector(state),
    globalSettings: state.settings,
    chartRotation: getChartRotationSelector(state),
    chartDimensions: getChartDimensionsSelector(state),
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
