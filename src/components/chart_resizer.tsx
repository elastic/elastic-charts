import React, { RefObject } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { debounce } from 'ts-debounce';
import { Dimensions } from '../utils/dimensions';
import { UpdateParentDimensionAction, updateParentDimensions } from '../state/actions/chart_settings';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_specs';
import { GlobalChartState } from '../state/chart_state';

interface ResizerProps {
  legendRendered: boolean;
  showLegend: boolean;
  resizeDebounce: number;
  updateParentDimensions(dimension: Dimensions): void;
}
class Resizer extends React.Component<ResizerProps> {
  private initialResizeComplete = false;
  private containerRef: RefObject<HTMLDivElement>;
  private ro: ResizeObserver;
  private onResizeDebounced: (entries: ResizeObserverEntry[]) => void = () => {};

  constructor(props: ResizerProps) {
    super(props);
    this.containerRef = React.createRef();
    this.ro = new ResizeObserver(this.handleResize);
  }

  componentDidMount() {
    this.onResizeDebounced = debounce(this.onResize, this.props.resizeDebounce);
  }

  componentDidUpdate() {
    if (this.props.legendRendered) {
      this.ro.observe(this.containerRef.current as Element);
    }
  }

  componentWillUnmount() {
    this.ro.unobserve(this.containerRef.current as Element);
  }

  onResize = (entries: ResizeObserverEntry[]) => {
    entries.forEach(({ contentRect: { width, height } }) => {
      this.props.updateParentDimensions({ width, height, top: 0, left: 0 });
    });
  };

  render() {
    return <div ref={this.containerRef} className="echChartResizer" />;
  }

  private handleResize = (entries: ResizeObserverEntry[]) => {
    if (this.initialResizeComplete) {
      this.onResizeDebounced(entries);
    } else {
      this.initialResizeComplete = true;
      this.onResize(entries);
    }
  };
}

const mapDispatchToProps = (dispatch: Dispatch<UpdateParentDimensionAction>) => {
  return {
    updateParentDimensions: (dimensions: Dimensions) => {
      dispatch(updateParentDimensions(dimensions));
    },
  };
};

const mapStateToProps = (state: GlobalChartState) => {
  const settings = getSettingsSpecSelector(state);
  return {
    legendRendered: state.legendRendered,
    showLegend: settings.showLegend,
    resizeDebounce: settings.resizeDebounce || 200,
  };
};

export const ChartResizer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Resizer);
