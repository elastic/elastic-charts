import { inject } from 'mobx-react';
import React, { createRef, CSSProperties, PureComponent } from 'react';
import { AnnotationTypes, RectAnnotationSpec } from '../lib/series/specs';
import { getGroupId } from '../lib/utils/ids';
import { SpecProps } from './specs_parser';

type RectAnnotationProps = SpecProps & RectAnnotationSpec;

export class RectAnnotationSpecComponent extends PureComponent<RectAnnotationProps> {
  static defaultProps: Partial<RectAnnotationProps> = {
    groupId: getGroupId('__global__'),
    annotationType: AnnotationTypes.Rectangle,
  };

  private markerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const { chartStore, children, ...config } = this.props;
    if (this.markerRef.current) {
      const { offsetWidth, offsetHeight } = this.markerRef.current;
      config.markerDimensions = {
        width: offsetWidth,
        height: offsetHeight,
      };
    }
    chartStore!.addAnnotationSpec({ ...config });
  }
  componentDidUpdate() {
    const { chartStore, children, ...config } = this.props;
    if (this.markerRef.current) {
      const { offsetWidth, offsetHeight } = this.markerRef.current;
      config.markerDimensions = {
        width: offsetWidth,
        height: offsetHeight,
      };
    }
    chartStore!.addAnnotationSpec({ ...config });
  }
  componentWillUnmount() {
    const { chartStore, annotationId } = this.props;
    chartStore!.removeAnnotationSpec(annotationId);
  }
  render() {
    if (!this.props.marker) {
      return null;
    }

    // We need to get the width & height of the marker passed into the spec
    // so we render the marker offscreen if one has been defined & update the config
    // with the width & height.
    const offscreenStyle: CSSProperties = {
      position: 'absolute',
      left: -9999,
      opacity: 0,
    };

    return (<div ref={this.markerRef} style={{ ...offscreenStyle }}>{this.props.marker}</div>);
  }
}

export const RectAnnotation = inject('chartStore')(RectAnnotationSpecComponent);
