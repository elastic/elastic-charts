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

// @ts-ignore
import d3TagCloud from 'd3-cloud';
import React, { MouseEvent, RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { Dimensions } from '../../../../utils/dimensions';
import { nullShapeViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { geometries } from '../../state/selectors/geometries';

function seed() {
  return 0.5;
}

function getFont(d) {
  return d.fontFamily;
}

function getFontStyle(d) {
  return d.style;
}

function getFontWeight(d) {
  return d.fontWeight;
}

function getWidth(conf) {
  return conf.width ?? 500;
}

function getHeight(conf) {
  return conf.height ?? 500;
}

function getFontSize(d) {
  return d.size;
}

function hashWithinRange(str, max) {
  str = JSON.stringify(str);
  let hash = 0;
  for (const ch of str) {
    hash = (hash * 31 + ch.charCodeAt(0)) % max;
  }
  return Math.abs(hash) % max;
}

function getRotation(startAngle, endAngle, count, text) {
  const angleRange = endAngle - startAngle;
  const count = count ?? 360;
  const interval = count - 1;
  const angleStep = interval === 0 ? 0: angleRange / interval;
  const index = hashWithinRange(text, count);
  return index * angleStep + startAngle;
}

function layoutMaker(config, data) {
  return d3TagCloud()
    .random(seed)
    .size([getWidth(config), getHeight(config)])
    .words(
      data.map((d) => ({
        text: d.text,
        color: d.color,
        fontFamily: config.fontFamily ?? 'Impact',
        style: config.fontStyle ?? 'normal',
        fontWeight: config.fontWeight ?? 'normal',
        size: config.minFontSize + (config.maxFontSize - config.minFontSize) * d.weight ** config.exponent,
      })),
    )
    .spiral(config.spiral ?? 'archimedean')
    .padding(config.padding ?? 5)
    .rotate((d) => getRotation(config.startAngle, config.endAngle, config.count, d.text))
    .font(getFont)
    .fontStyle(getFontStyle)
    .fontWeight(getFontWeight)
    .fontSize((d) => getFontSize(d));
}

const View = ({ words, conf }) => (
  <svg width={getWidth(conf)} height={getHeight(conf)}>
    <g transform={`translate(${getWidth(conf) / 2}, ${getHeight(conf) / 2})`}>
      {words.map((d) => (
        <text
          style={{
            transform: `translate(${d.x}, ${d.y}) rotate(${d.rotate})`,
            fontSize: getFontSize(d),
            fontStyle: getFontStyle(d),
            fontFamily: getFont(d),
            fontWeight: getFontWeight(d),
            fill: d.color,
          }}
          textAnchor={'middle'}
          transform={`translate(${d.x}, ${d.y}) rotate(${d.rotate})`}
        >
          {d.text}
        </text>
      ))}
    </g>
  </svg>
);

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
  static displayName = 'Wordcloud';

  // firstRender = true; // this'll be useful for stable resizing of treemaps
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

  handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      geometries,
    } = this.props;
    if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0) {
      return;
    }
    const picker = geometries.pickQuads;
    const box = forwardStageRef.current.getBoundingClientRect();
    const { chartCenter } = geometries;
    const x = e.clientX - box.left - chartCenter.x;
    const y = e.clientY - box.top - chartCenter.y;
    return picker(x, y);
  }

  render() {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      geometries: { bulletViewModel },
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    const conf1 = {
      width,
      height,
      startAngle: bulletViewModel.startAngle,
      endAngle: bulletViewModel.endAngle,
      count: bulletViewModel.angleCount,
      padding: bulletViewModel.padding,
      fontWeight: bulletViewModel.fontWeight,
      fontFamily: bulletViewModel.fontFamily,
      fontStyle: bulletViewModel.fontStyle,
      minFontSize: bulletViewModel.minFontSize,
      maxFontSize: bulletViewModel.maxFontSize,
      spiral: bulletViewModel.spiral,
      exponent: bulletViewModel.exponent,
    };

    const layout = layoutMaker(conf1, bulletViewModel.data);

    let ww;
    layout.on('end', (w) => (ww = w)).start();

    return (
      <>
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          onMouseMove={this.handleMouseMove.bind(this)}
          style={{
            width,
            height,
          }}
        />
        <View words={ww} conf={conf1} />
      </>
    );
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  private drawCanvas() {
    if (this.ctx) {
      /*      const { width, height }: Dimensions = this.props.chartContainerDimensions;
                renderCanvas2d(this.ctx, this.devicePixelRatio, {
             ...this.props.geometries,
             config: { ...this.props.geometries.config, width, height },
           });
      */
    }
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
    chartContainerDimensions: state.parentDimensions,
  };
};

/** @internal */
export const Wordcloud = connect(mapStateToProps, mapDispatchToProps)(Component);
