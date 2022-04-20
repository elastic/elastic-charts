/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ScreenReaderSummary } from '../../../../components/accessibility';
import { clearCanvas, withContext } from '../../../../renderers/canvas';
import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { chartSize } from '../../state/selectors/chart_size';
import { data } from '../../state/selectors/data';

interface ReactiveChartStateProps {
  initialized: boolean;
  size: {
    width: number;
    height: number;
  };
  data: number[];
  a11y: A11ySettings;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;
class Component extends React.Component<Props> {
  static displayName = 'TODO_SPECIFY_YOUR_CHART_NAME';

  private ctx: CanvasRenderingContext2D | null;
  private readonly devicePixelRatio: number;

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
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
      // TODO render your chart here
      const {
        data,
        size: { width, height },
      } = this.props;
      clearCanvas(this.ctx, 'white');
      withContext(this.ctx, (ctx) => {
        ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        data.forEach((d, i) => {
          const step = width / data.length;
          const h = height * d;
          const x = step * i;
          const y = height - h;
          ctx.fillStyle = 'black';
          ctx.fillRect(x, y, step, h);
          ctx.fillStyle = 'white';
          ctx.fillText(`${d * 100}%`, x + step / 2, y + h / 2);
        });
      });
    }
  }

  render() {
    const {
      initialized,
      size: { width, height },
      a11y,
      forwardStageRef,
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    return (
      <figure aria-labelledby={a11y.labelId} aria-describedby={a11y.descriptionId}>
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        >
          <ScreenReaderSummary />
        </canvas>
      </figure>
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
  data: [],
  size: {
    width: 0,
    height: 0,
  },
  a11y: DEFAULT_A11Y_SETTINGS,
};
const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    data: data(state),
    size: chartSize(state),
    a11y: getA11ySettingsSelector(state),
  };
};

/** @internal */
export const Viz = connect(mapStateToProps, mapDispatchToProps)(Component);
