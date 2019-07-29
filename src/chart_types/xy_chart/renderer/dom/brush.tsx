import React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { connect } from 'react-redux';
import { getChartDimensionsSelector } from 'store/selectors/get_chart_dimensions';
import { Dimensions } from 'utils/dimensions';
import { isInitialized } from 'store/selectors/is_initialized';
import { computeChartTransformSelector } from 'chart_types/xy_chart/store/selectors/compute_chart_transform';
import { Transform } from 'chart_types/xy_chart/store/utils';

import { IChartState } from 'store/chart_store';
import { getBrushAreaSelector } from 'chart_types/xy_chart/store/selectors/get_brush_area';
import { isBrushAvailableSelector } from 'chart_types/xy_chart/store/selectors/is_brush_available';
import { isBrushingEnabledSelector } from 'chart_types/xy_chart/store/selectors/is_brushing_enabled';

interface Props {
  initialized: boolean;
  chartDimensions: Dimensions;
  chartTransform: Transform;
  isBrushAvailable: boolean | undefined;
  brushArea: Dimensions | null;
}

class BrushToolComponent extends React.Component<Props> {
  static displayName = 'BrushToolComponent';

  renderBrushTool = (brushArea: Dimensions | null) => {
    if (!brushArea) {
      return null;
    }
    const { top, left, width, height } = brushArea;
    return <Rect x={left} y={top} width={width} height={height} fill="gray" opacity={0.6} />;
  };

  render() {
    const { initialized, isBrushAvailable, chartDimensions, chartTransform, brushArea } = this.props;
    if (!initialized || !isBrushAvailable) {
      return null;
    }

    return (
      <Stage
        width={chartDimensions.width}
        height={chartDimensions.height}
        className="echBrushTool"
        style={{
          top: chartDimensions.top + chartTransform.x,
          left: chartDimensions.left + chartTransform.y,
          width: chartDimensions.width,
          height: chartDimensions.height,
        }}
      >
        <Layer hitGraphEnabled={false} listening={false}>
          {this.renderBrushTool(brushArea)}
        </Layer>
      </Stage>
    );
  }
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state: IChartState) => {
  if (!isInitialized(state)) {
    return {
      initialized: false,
      isBrushAvailable: false,
      brushArea: null,
      chartDimensions: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      chartTransform: {
        x: 0,
        y: 0,
        rotate: 0,
      },
    };
  }
  return {
    initialized: state.initialized,
    brushArea: getBrushAreaSelector(state),
    isBrushAvailable: isBrushAvailableSelector(state),
    chartDimensions: getChartDimensionsSelector(state),
    chartTransform: computeChartTransformSelector(state),
    isBrushingEnabled: isBrushingEnabledSelector(state),
  };
};

export const BrushTool = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BrushToolComponent);
