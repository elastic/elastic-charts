import { inject, observer } from 'mobx-react';
import React from 'react';
import { isPointGeometry } from '../chart_types/xy_chart/rendering/rendering';
import { ChartStore } from '../chart_types/xy_chart/store/chart_state';

interface HighlighterProps {
  chartStore?: ChartStore;
}

class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  render() {
    const { highlightedGeometries, chartTransform, chartDimensions, chartRotation } = this.props.chartStore!;
    const left = chartDimensions.left + chartTransform.x;
    const top = chartDimensions.top + chartTransform.y;
    const clipWidth = [90, -90].includes(chartRotation) ? chartDimensions.height : chartDimensions.width;
    const clipHeight = [90, -90].includes(chartRotation) ? chartDimensions.width : chartDimensions.height;
    return (
      <svg className="echHighlighter">
        <defs>
          <clipPath id="echHighlighterClipPath">
            <rect x="0" y="0" width={clipWidth} height={clipHeight} />
          </clipPath>
        </defs>
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
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={geom.width}
                height={geom.height}
                className="echHighlighter__rect"
                clipPath="url(#echHighlighterClipPath)"
              />
            );
          })}
        </g>
      </svg>
    );
  }
}

export const Highlighter = inject('chartStore')(observer(HighlighterComponent));
