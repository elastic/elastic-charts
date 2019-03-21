import { inject } from 'mobx-react';
import { PureComponent } from 'react';
import { LineAnnotationSpec } from '../lib/series/specs';
// import { getGroupId } from '../lib/utils/ids';
// import { ScaleType } from '../lib/utils/scales/scales';
import { SpecProps } from './specs_parser';

type LineAnnotationProps = SpecProps & LineAnnotationSpec;

export class AnnotationsSpecComponent extends PureComponent<LineAnnotationProps> {
  static defaultProps: Partial<LineAnnotationProps> = {
  };
  componentDidMount() {
    // const { chartStore, ...config } = this.props;
    // chartStore!.addAnnotationSpec({ ...config });
  }
  componentDidUpdate() {
    // const { chartStore, ...config } = this.props;
    // chartStore!.addAnnotationSpec({ ...config });
  }
  componentWillUnmount() {
    // const { chartStore, annotationId } = this.props;
    // chartStore!.removeAnnotationSpec(annotationId);
  }
  render() {
    return null;
  }
}

export const Annotations = inject('chartStore')(AnnotationsSpecComponent);
