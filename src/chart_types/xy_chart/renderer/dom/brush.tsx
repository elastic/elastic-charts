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

import { clearCanvas, withContext, withClip } from '../../../../renderers/canvas';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getInternalIsInitializedSelector } from '../../../../state/selectors/get_internal_is_intialized';
import { Dimensions } from '../../../../utils/dimensions';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import { getBrushAreaSelector } from '../../state/selectors/get_brush_area';
import { isBrushAvailableSelector } from '../../state/selectors/is_brush_available';
import { isBrushingSelector } from '../../state/selectors/is_brushing';
import { renderRect } from '../canvas/primitives/rect';

interface Props {
  initialized: boolean;
  chartDimensions: Dimensions;
  chartContainerDimensions: Dimensions;
  isBrushing: boolean | undefined;
  isBrushAvailable: boolean | undefined;
  brushArea: Dimensions | null;
}

class BrushToolComponent extends React.Component<Props> {
  static displayName = 'BrushToolComponent';

  private readonly devicePixelRatio: number;
  private ctx: CanvasRenderingContext2D | null;
  private canvasRef: RefObject<HTMLCanvasElement>;

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
    }
  }

  private drawCanvas = () => {
    const { brushArea, chartDimensions } = this.props;
    if (!this.ctx || !brushArea) {
      return;
    }
    const { top, left, width, height } = brushArea;
    withContext(this.ctx, (ctx) => {
      ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
      withClip(
        ctx,
        {
          x: chartDimensions.left,
          y: chartDimensions.top,
          width: chartDimensions.width,
          height: chartDimensions.height,
        },
        (ctx) => {
          clearCanvas(ctx, 200000, 200000);
          ctx.translate(chartDimensions.left, chartDimensions.top);
          renderRect(
            ctx,
            {
              x: left,
              y: top,
              width,
              height,
            },
            {
              color: {
                r: 128,
                g: 128,
                b: 128,
                opacity: 0.6,
              },
            },
          );
        },
      );
    });
  };

  private tryCanvasContext() {
    const canvas = this.canvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  render() {
    const { initialized, isBrushAvailable, isBrushing, chartContainerDimensions } = this.props;
    if (!initialized || !isBrushAvailable || !isBrushing) {
      this.ctx = null;
      return null;
    }
    const { width, height } = chartContainerDimensions;
    return (
      <canvas
        ref={this.canvasRef}
        className="echBrushTool"
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

const mapStateToProps = (state: GlobalChartState): Props => {
  if (!getInternalIsInitializedSelector(state)) {
    return {
      initialized: false,
      isBrushing: false,
      isBrushAvailable: false,
      brushArea: null,
      chartContainerDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      },
      chartDimensions: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
    };
  }
  return {
    initialized: state.specsInitialized,
    chartContainerDimensions: getChartContainerDimensionsSelector(state),
    brushArea: getBrushAreaSelector(state),
    isBrushAvailable: isBrushAvailableSelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    isBrushing: isBrushingSelector(state),
  };
};

/** @internal */
export const BrushTool = connect(mapStateToProps)(BrushToolComponent);
