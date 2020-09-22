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
 * under the License.
 */

import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { Dimensions } from '../../../../utils/dimensions';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { geometries } from '../../state/selectors/geometries';
import { renderCanvas2d } from './canvas_renderers';

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  chartContainerDimensions: Dimensions;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;
class Component extends React.Component<Props> {
  static displayName = 'Heatmap';
  // firstRender = true; // this will be useful for stable resizing of treemaps
  private ctx: CanvasRenderingContext2D | null;
  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  private drawCanvas() {
    if (this.ctx) {
      const { width, height }: Dimensions = this.props.chartContainerDimensions;
      renderCanvas2d(this.ctx, this.devicePixelRatio, {
        ...this.props.geometries,
        config: { ...this.props.geometries.config, width, height },
      });
    }
  }

  // handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
  //   const {
  //     initialized,
  //     chartContainerDimensions: { width, height },
  //     forwardStageRef,
  //     geometries,
  //   } = this.props;
  //   if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0) {
  //     return;
  //   }
  //   const picker = geometries.pickQuads;
  //   const box = forwardStageRef.current.getBoundingClientRect();
  //   const { chartCenter } = geometries;
  //   const x = e.clientX - box.left - chartCenter.x;
  //   const y = e.clientY - box.top - chartCenter.y;
  //   const pickedShapes: Array<BulletViewModel> = picker(x, y);
  //   return pickedShapes;
  // }

  render() {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    // TODO the following commented code is a test using CSS Grid instead of canvas to render the heatmap
    // const { xValues, yValues } = geometries.heatmapViewModel;

    // const gridContainer = {
    //   display: 'grid',
    //   width: '100%',
    //   height: '100%',
    //   gridTemplateColumns: `fit-content(100px) repeat(${xValues.length}, 1fr)`,
    //   gridTemplateRows: `repeat(${yValues.length}, minmax(30px, 1fr))`,
    // };

    // console.log(geometries.heatmapViewModel.xValues, gridContainer);
    return (
      // <div style={gridContainer}>
      //   {geometries.heatmapViewModel.cells.map((c, i) => {
      //     if (i % geometries.heatmapViewModel.xValues.length === 0) {
      //       return (
      //         <>
      //           <div
      //             key={`0-${c.x} - ${c.y}`}
      //             className="cellItem"
      //             style={{
      //               textAlign: 'right',
      //               maxHeight: '30px',
      //               textOverflow: 'ellipsis',
      //               overflow: 'hidden',
      //               // whiteSpace: 'nowrap',
      //             }}
      //           >
      //             {geometries.heatmapViewModel.yValues[0]}
      //           </div>
      //           <div
      //             key={`${c.x} - ${c.y}`}
      //             className="cellItem"
      //             style={{ background: c.fill.color, textAlign: 'center' }}
      //           >
      //             {c.formatted}
      //           </div>
      //         </>
      //       );
      //     }
      //
      //     return (
      //       <div key={`${c.x} - ${c.y}`} className="cellItem" style={{ background: c.fill.color, textAlign: 'center' }}>
      //         {c.formatted}
      //       </div>
      //     );
      //   })}
      // </div>
      <canvas
        ref={forwardStageRef}
        className="echCanvasRenderer"
        width={width * this.devicePixelRatio}
        height={height * this.devicePixelRatio}
        style={{
          width,
          height,
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
  geometries: nullShapeViewModel(),
  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    geometries: geometries(state),
    chartContainerDimensions: getChartContainerDimensionsSelector(state),
  };
};

/** @internal */
export const Heatmap = connect(mapStateToProps, mapDispatchToProps)(Component);
