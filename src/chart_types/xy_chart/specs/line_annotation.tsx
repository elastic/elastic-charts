import React, { createRef, CSSProperties, PureComponent } from 'react';
import { LineAnnotationSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../../../utils/themes/theme';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { upsertSpec, removeSpec } from '../../../state/actions/specs';
import { Spec } from '../../../specs';

type InjectedProps = LineAnnotationSpec &
  DispatchProps &
  Readonly<{
    children?: React.ReactNode;
  }>;
export class LineAnnotationSpecComponent extends PureComponent<LineAnnotationSpec> {
  static defaultProps: Partial<LineAnnotationSpec> = {
    chartType: 'xy_axis',
    specType: 'annotation',
    groupId: DEFAULT_GLOBAL_ID,
    annotationType: 'line',
    style: DEFAULT_ANNOTATION_LINE_STYLE,
    hideLines: false,
    hideTooltips: false,
    zIndex: 1,
  };

  private markerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const { children, upsertSpec, removeSpec, ...config } = this.props as InjectedProps;
    if (this.markerRef.current) {
      const { offsetWidth, offsetHeight } = this.markerRef.current;
      config.markerDimensions = {
        width: offsetWidth,
        height: offsetHeight,
      };
    }
    upsertSpec({ ...config });
  }
  componentDidUpdate() {
    const { upsertSpec, removeSpec, children, ...config } = this.props as InjectedProps;
    if (this.markerRef.current) {
      const { offsetWidth, offsetHeight } = this.markerRef.current;
      config.markerDimensions = {
        width: offsetWidth,
        height: offsetHeight,
      };
    }
    upsertSpec({ ...config });
  }
  componentWillUnmount() {
    const { removeSpec, id } = this.props as InjectedProps;
    removeSpec(id);
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

    return (
      <div ref={this.markerRef} style={{ ...offscreenStyle }}>
        {this.props.marker}
      </div>
    );
  }
}

interface DispatchProps {
  upsertSpec: (spec: Spec) => void;
  removeSpec: (id: string) => void;
}
const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      upsertSpec,
      removeSpec,
    },
    dispatch,
  );

const mapStateToProps = () => ({});

export const LineAnnotation = connect<{}, DispatchProps, LineAnnotationSpec>(
  mapStateToProps,
  mapDispatchToProps,
)(LineAnnotationSpecComponent);
