import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onChartRendered } from '../../../../state/actions/chart';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { GlobalChartState } from '../../../../state/chart_state';
import { Dimensions } from '../../../../utils/dimensions';
import { Theme } from '../../../../utils/themes/theme';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { partitionGeometries } from '../../state/selectors/geometries';
import { nullSectorViewModel, ShapeViewModel } from '../../layout/types/ViewModelTypes';
import { renderPartitionCanvas2d } from './canvasRenderers';

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  chartContainerDimensions: Dimensions;
  theme: Theme;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

type PartitionProps = ReactiveChartStateProps & ReactiveChartDispatchProps;
class PartitionComponent extends React.Component<PartitionProps> {
  static displayName = 'Partition';
  // firstRender = true; // this'll be useful for stable resizing of treemaps
  private readonly canvasRef: React.RefObject<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null;
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions
  constructor(props: Readonly<PartitionProps>) {
    super(props);
    this.canvasRef = React.createRef();
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  private drawCanvas() {
    if (this.ctx) {
      const { width, height }: Dimensions = this.props.chartContainerDimensions;
      renderPartitionCanvas2d(this.ctx, this.devicePixelRatio, {
        ...this.props.geometries,
        config: { ...this.props.geometries.config, width, height },
      });
    }
  }

  componentDidUpdate() {
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  componentDidMount() {
    // the DOM element has just been appended, and getContext('2d') is always non-null,
    // so we could use a couple of ! non-null assertions but no big plus
    const canvas = this.canvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
    this.drawCanvas();
  }

  render() {
    const { initialized, chartContainerDimensions } = this.props;
    if (!initialized || chartContainerDimensions.width === 0 || chartContainerDimensions.height === 0) {
      return null;
    }

    return (
      <canvas
        ref={this.canvasRef}
        width={chartContainerDimensions.width * this.devicePixelRatio}
        height={chartContainerDimensions.height * this.devicePixelRatio}
        style={{
          padding: 0,
          margin: 0,
          border: 0,
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          width: chartContainerDimensions.width,
          height: chartContainerDimensions.height,
        }}
      />
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  theme: LIGHT_THEME,
  geometries: nullSectorViewModel(),
  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (!isInitialized(state)) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    theme: getChartThemeSelector(state),
    geometries: partitionGeometries(state),
    chartContainerDimensions: state.parentDimensions,
  };
};

export const Partition = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PartitionComponent);
