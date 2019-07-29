import React from 'react';
import { isLineAnnotation, AnnotationSpec } from '../../utils/specs';
import { AnnotationId } from 'utils/ids';
import {
  AnnotationDimensions,
  AnnotationLineProps,
  AnnotationTooltipState,
  AnnotationTooltipFormatter,
} from '../../annotations/annotation_utils';
import { connect } from 'react-redux';
import { Dimensions } from 'utils/dimensions';
import { IChartState } from 'store/chart_store';
import { isInitialized } from 'store/selectors/is_initialized';
import { getChartDimensionsSelector } from 'store/selectors/get_chart_dimensions';
import { computeAnnotationDimensionsSelector } from 'chart_types/xy_chart/store/selectors/compute_annotations';
import { getAnnotationSpecsSelector } from 'chart_types/xy_chart/store/selectors/get_specs';
import { getAnnotationTooltipStateSelector } from 'chart_types/xy_chart/store/selectors/get_annotation_tooltip_state';
import { isChartEmptySelector } from 'chart_types/xy_chart/store/selectors/is_chart_empty';

interface AnnotationTooltipProps {
  isChartEmpty: boolean;
  tooltipState: AnnotationTooltipState | null;
  chartDimensions: Dimensions;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
}
class AnnotationTooltipComponent extends React.Component<AnnotationTooltipProps> {
  static displayName = 'AnnotationTooltip';

  renderTooltip() {
    const { tooltipState } = this.props;

    if (!tooltipState || !tooltipState.isVisible) {
      return <div className="echAnnotation__tooltip echAnnotation__tooltip--hidden" />;
    }

    const { transform, details, header } = tooltipState;
    const chartDimensions = this.props.chartDimensions;

    const tooltipTop = tooltipState.top;
    const tooltipLeft = tooltipState.left;
    const top = tooltipTop == null ? chartDimensions.top : chartDimensions.top + tooltipTop;
    const left = tooltipLeft == null ? chartDimensions.left : chartDimensions.left + tooltipLeft;

    const position = {
      transform,
      top,
      left,
    };

    switch (tooltipState.annotationType) {
      case 'line': {
        const props = { position, details, header };
        return <LineAnnotationTooltip {...props} />;
      }
      case 'rectangle': {
        const props = { details, position, customTooltip: tooltipState.renderTooltip };
        return <RectAnnotationTooltip {...props} />;
      }
      default:
        return null;
    }
  }

  renderAnnotationLineMarkers(annotationLines: AnnotationLineProps[], id: AnnotationId): JSX.Element[] {
    const { chartDimensions } = this.props;

    const markers: JSX.Element[] = [];

    annotationLines.forEach((line: AnnotationLineProps, index: number) => {
      if (!line.marker) {
        return;
      }

      const { transform, icon, color } = line.marker;

      const style = {
        color,
        transform,
        top: chartDimensions.top,
        left: chartDimensions.left,
      };

      const markerElement = (
        <div className="echAnnotation" style={{ ...style }} key={`annotation-${id}-${index}`}>
          {icon}
        </div>
      );

      markers.push(markerElement);
    });

    return markers;
  }

  renderAnnotationMarkers(): JSX.Element[] {
    const { annotationDimensions, annotationSpecs } = this.props;
    const markers: JSX.Element[] = [];

    annotationDimensions.forEach((dimensions: AnnotationDimensions, id: AnnotationId) => {
      const annotationSpec = annotationSpecs.find((spec) => spec.id === id);
      if (!annotationSpec) {
        return;
      }

      if (isLineAnnotation(annotationSpec)) {
        const annotationLines = dimensions as AnnotationLineProps[];
        const lineMarkers = this.renderAnnotationLineMarkers(annotationLines, id);
        markers.push(...lineMarkers);
      }
    });

    return markers;
  }

  render() {
    const { isChartEmpty } = this.props;

    if (isChartEmpty) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderAnnotationMarkers()}
        {this.renderTooltip()}
      </React.Fragment>
    );
  }
}

function RectAnnotationTooltip(props: {
  details?: string;
  position: { transform: string; top: number; left: number };
  customTooltip?: AnnotationTooltipFormatter;
}) {
  const { details, position, customTooltip } = props;
  const tooltipContent = customTooltip ? customTooltip(details) : details;

  if (!tooltipContent) {
    return null;
  }

  return (
    <div className="echAnnotation__tooltip" style={{ ...position }}>
      <div className="echAnnotation__details">
        <div className="echAnnotation__detailsText">{tooltipContent}</div>
      </div>
    </div>
  );
}

function LineAnnotationTooltip(props: {
  details?: string;
  header?: string;
  position: { transform: string; top: number; left: number };
}) {
  const { details, position, header } = props;
  return (
    <div className="echAnnotation__tooltip" style={{ ...position }}>
      <p className="echAnnotation__header">{header}</p>
      <div className="echAnnotation__details">{details}</div>
    </div>
  );
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state: IChartState): AnnotationTooltipProps => {
  if (!isInitialized(state)) {
    return {
      isChartEmpty: true,
      chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
      annotationDimensions: new Map(),
      annotationSpecs: [],
      tooltipState: null,
    };
  }
  return {
    isChartEmpty: isChartEmptySelector(state),
    chartDimensions: getChartDimensionsSelector(state),
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    tooltipState: getAnnotationTooltipStateSelector(state),
  };
};

export const AnnotationTooltip = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AnnotationTooltipComponent);
