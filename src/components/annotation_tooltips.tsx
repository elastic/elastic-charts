// import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { AnnotationId } from '../lib/utils/ids';
import { AnnotationLineProps } from '../state/annotation_utils';
import { ChartStore } from '../state/chart_state';

interface AnnotationTooltipProps {
  chartStore?: ChartStore;
}

class AnnotationTooltipComponent extends React.Component<AnnotationTooltipProps> {
  static displayName = 'AnnotationTooltip';

  renderTooltip() {
    const annotationTooltipState = this.props.chartStore!.annotationTooltipState.get();
    if (!annotationTooltipState || !annotationTooltipState.isVisible) {
      return <div className="elasticChartsAnnotation__tooltip elasticChartsAnnotation__tooltip--hidden" />;
    }

    const transform = annotationTooltipState.transform;
    const chartDimensions = this.props.chartStore!.chartDimensions;

    const style = {
      transform,
      top: chartDimensions.top,
      left: chartDimensions.left,
    };

    return (
      <div className="elasticChartsAnnotation__tooltip" style={{ ...style }}>
        <p className="elasticChartsAnnotation__header">{annotationTooltipState.header}</p>
        <div className="elasticChartsAnnotation__details">
          {annotationTooltipState.details}
        </div>
      </div>
    );
  }

  renderAnnotationMarkers(): JSX.Element[] {
    const markers: JSX.Element[] = [];
    const chartDimensions = this.props.chartStore!.chartDimensions;

    this.props.chartStore!.annotationDimensions.forEach((annotationLines: AnnotationLineProps[], id: AnnotationId) => {
      // TODO: check for annotation type
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
          <div className="elasticChartsAnnotation" style={{ ...style }} key={`annotation-${id}-${index}`}>
            {icon}
          </div>
        );

        markers.push(markerElement);
      });
    });

    return markers;
  }

  render() {
    return (
      <div>
        {this.renderAnnotationMarkers()}
        {this.renderTooltip()}
      </div>
    );
  }
}

export const AnnotationTooltip = inject('chartStore')(observer(AnnotationTooltipComponent));
