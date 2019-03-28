// import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { ChartStore } from '../state/chart_state';

interface AnnotationTooltipProps {
  chartStore?: ChartStore;
}

class AnnotationTooltipComponent extends React.Component<AnnotationTooltipProps> {
  static displayName = 'AnnotationTooltip';

  render() {
    const annotationTooltipState = this.props.chartStore!.annotationTooltipState.get();
    const transform = `translate(0, 0)`;

    if (!annotationTooltipState || !annotationTooltipState.isVisible) {
      return <div className="elasticChartsTooltip elasticChartsTooltip--hidden" />;
    }
    return (
      <div className="elasticChartsTooltip" style={{ transform }}>
        <p className="elasticChartsTooltip__header">{annotationTooltipState.header}</p>
        <div className="elasticChartsTooltip__details">
          {annotationTooltipState.details}
        </div>
      </div>
    );
  }
}

export const AnnotationTooltip = inject('chartStore')(observer(AnnotationTooltipComponent));
