import React from 'react';
import { isPointGeometry, IndexedGeometry } from '../../../../utils/geometry';
import { IChartState } from 'store/chart_store';
import { isInitialized } from 'store/selectors/is_initialized';
import { getChartDimensionsSelector } from 'store/selectors/get_chart_dimensions';
import { computeChartTransformSelector } from 'chart_types/xy_chart/store/selectors/compute_chart_transform';
import { getHighlightedGeomsSelector } from 'chart_types/xy_chart/store/selectors/get_tooltip_values_highlighted_geoms';
import { connect } from 'react-redux';
import { Dimensions } from 'utils/dimensions';
import { Rotation } from 'chart_types/xy_chart/utils/specs';
import { Transform } from 'chart_types/xy_chart/store/utils';
import { getChartRotationSelector } from 'store/selectors/get_chart_rotation';

interface HighlighterProps {
  highlightedGeometries: IndexedGeometry[];
  initialized: boolean;
  chartTransform: Transform;
  chartDimensions: Dimensions;
  chartRotation: Rotation;
}

class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  render() {
    const { highlightedGeometries, chartTransform, chartDimensions, chartRotation } = this.props;
    const left = chartDimensions.left + chartTransform.x;
    const top = chartDimensions.top + chartTransform.y;
    return (
      <svg className="echHighlighter">
        <g transform={`translate(${left}, ${top}) rotate(${chartRotation})`}>
          {highlightedGeometries.map((geom, i) => {
            const { color, x, y } = geom;
            if (isPointGeometry(geom)) {
              return (
                <circle
                  key={i}
                  cx={x + geom.transform.x}
                  cy={y}
                  r={geom.radius}
                  stroke={color}
                  strokeWidth={4}
                  fill="transparent"
                />
              );
            }
            return <rect key={i} x={x} y={y} width={geom.width} height={geom.height} fill="black" opacity={1} />;
          })}
        </g>
      </svg>
    );
  }
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state: IChartState): HighlighterProps => {
  if (!isInitialized(state)) {
    return {
      initialized: false,
      highlightedGeometries: [],
      chartTransform: {
        x: 0,
        y: 0,
        rotate: 0,
      },
      chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
      chartRotation: 0,
    };
  }
  return {
    initialized: true,
    highlightedGeometries: getHighlightedGeomsSelector(state),
    chartTransform: computeChartTransformSelector(state),
    chartDimensions: getChartDimensionsSelector(state),
    chartRotation: getChartRotationSelector(state),
  };
};

export const Highlighter = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HighlighterComponent);
