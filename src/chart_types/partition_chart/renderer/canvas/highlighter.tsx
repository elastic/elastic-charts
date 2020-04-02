/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import React from 'react';
import { connect } from 'react-redux';
import { GlobalChartState } from '../../../../state/chart_state';
import { isInitialized } from '../../../../state/selectors/is_initialized';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { TAU } from '../../layout/utils/math';
import { partitionGeometries } from '../../state/selectors/geometries';
import { PointObject } from '../../layout/types/geometry_types';
import { getHighlightedSectorsSelector } from '../../state/selectors/get_highlighted_shapes';

interface HighlighterProps {
  initialized: boolean;
  geometries: QuadViewModel[];
  diskCenter: PointObject;
  radius: number;
}

function getShapeFromValues(x: number, y: number, r: number, a0: number, a1: number, ccw: number): string {
  const dx = r * Math.cos(a0);
  const dy = r * Math.sin(a0);
  const x0 = x + dx;
  const y0 = y + dy;
  const cw = 1 ^ ccw;
  let da = ccw ? a0 - a1 : a1 - a0;
  const path: string[] = [];
  path.push(`M${x0},${y0}`);

  if (!r) return '';
  if (da < 0) {
    da = (da % TAU) + TAU;
  }
  if (da > TAU - 1e-6) {
    path.push(`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${x0},${y0}`);
  }

  // Is this arc non-empty? Draw an arc!
  else if (da > 1e-6) {
    path.push(`A${r},${r},0,${+(da >= Math.PI)},${cw},${x + r * Math.cos(a1)},${y + r * Math.sin(a1)}`);
  }
  path.push(`L${x},${y}Z`);
  return path.join('');
}

class HighlighterComponent extends React.Component<HighlighterProps> {
  static displayName = 'Highlighter';

  render() {
    const { geometries, diskCenter, radius } = this.props;
    if (geometries.length === 0) {
      return null;
    }
    return (
      <svg className="echHighlighter" width="100%" height="100%">
        {/* <defs>
          <mask id="echHighlighterMask">
            <rect x={0} y={0} width="1500" height="1500" fill="white" /> */}
        {geometries.map(({ x0, x1, y0px, y1px }, index) => {
          const X0 = x0 - TAU / 4;
          const X1 = x1 - TAU / 4;
          const path = [
            getShapeFromValues(0, 0, y0px, X0, X0, 0),
            getShapeFromValues(0, 0, y1px, X0, X1, 0),
            getShapeFromValues(0, 0, y0px, X1, X0, 1),
          ].join('');
          return <path key={index} d={path} transform={`translate(${diskCenter.x}, ${diskCenter.y})`} fill="black" />;
        })}
        {/* </mask>
        </defs>

        <circle
          cx={diskCenter.x}
          cy={diskCenter.y}
          r={radius}
          mask="url(#echHighlighterMask)"
          opacity="0.75"
          fill="white"
        /> */}
      </svg>
    );
  }
}

const DEFAULT_PROPS: HighlighterProps = {
  initialized: false,
  geometries: [],
  diskCenter: {
    x: 0,
    y: 0,
  },
  radius: 10,
};

const mapStateToProps = (state: GlobalChartState): HighlighterProps => {
  if (!isInitialized(state)) {
    return DEFAULT_PROPS;
  }
  const model = partitionGeometries(state);
  return {
    initialized: true,
    geometries: getHighlightedSectorsSelector(state),
    diskCenter: model.diskCenter,
    radius: model.outerRadius,
  };
};

/** @internal */
export const Highlighter = connect(mapStateToProps)(HighlighterComponent);
