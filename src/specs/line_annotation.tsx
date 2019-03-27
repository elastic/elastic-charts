import { inject } from 'mobx-react';
import { PureComponent } from 'react';
import { AnnotationType, LineAnnotationSpec } from '../lib/series/specs';
import { getGroupId } from '../lib/utils/ids';
import { SpecProps } from './specs_parser';

type LineAnnotationProps = SpecProps & LineAnnotationSpec;

export class LineAnnotationSpecComponent extends PureComponent<LineAnnotationProps> {
  static defaultProps: Partial<LineAnnotationProps> = {
    groupId: getGroupId('__global__'),
    annotationType: AnnotationType.Line,
  };
  componentDidMount() {
    const { chartStore, children, ...config } = this.props;
    chartStore!.addAnnotationSpec({ ...config });
  }
  componentDidUpdate() {
    const { chartStore, children, ...config } = this.props;
    chartStore!.addAnnotationSpec({ ...config });
  }
  componentWillUnmount() {
    const { chartStore, annotationId } = this.props;
    chartStore!.removeAnnotationSpec(annotationId);
  }
  render() {
    return null;
  }
}

export const LineAnnotation = inject('chartStore')(LineAnnotationSpecComponent);
