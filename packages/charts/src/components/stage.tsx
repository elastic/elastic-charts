/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { CSSProperties, RefObject } from 'react';
import React from 'react';

import { CanvasPainter } from '../renderers/canvas/painter';
import type { Painter } from '../renderers/painter';
import type { StageElement } from '../state/internal_chart_renderer';

/** @internal */
export interface StageProps {
  /** CSS pixel size of the stage */
  width: number;
  height: number;
  devicePixelRatio: number;
  /** the inherited writing direction of the text drawn on the stage */
  dir?: 'ltr' | 'rtl';
  /** the chart's stage element */
  forwardStageRef: RefObject<StageElement>;
  /** extra class and style for overlays, such as the brush tool */
  className?: string;
  style?: CSSProperties;
  /** draws one frame; called in CSS pixel coordinates, the device pixel ratio is already applied */
  paint: (painter: Painter) => void;
  /** called after each frame has been committed to the DOM */
  onRendered?: () => void;
}

/**
 * The drawing surface of a chart: a `<canvas>` painted imperatively after each commit by the
 * `paint` function the chart type supplies, through a `Painter`.
 * @internal
 */
export class Stage extends React.Component<StageProps> {
  static displayName = 'Stage';

  // one painter per context: it caches pattern tiles across frames
  private canvasContext: CanvasRenderingContext2D | null = null;
  private canvasPainter: CanvasPainter | null = null;

  componentDidMount() {
    this.afterCommit();
  }

  componentDidUpdate() {
    this.afterCommit();
  }

  private afterCommit() {
    this.paintCanvas();
    this.props.onRendered?.();
  }

  private paintCanvas() {
    const ctx = this.props.forwardStageRef.current?.getContext('2d') ?? null;
    if (!ctx) return;
    if (ctx !== this.canvasContext || !this.canvasPainter) {
      this.canvasContext = ctx;
      this.canvasPainter = new CanvasPainter(ctx);
    }
    this.canvasPainter.begin(this.props.devicePixelRatio);
    this.props.paint(this.canvasPainter);
  }

  render() {
    const { width, height, devicePixelRatio, dir, forwardStageRef, className, style } = this.props;
    return (
      <canvas
        dir={dir}
        ref={forwardStageRef}
        className={classNames('echCanvasRenderer', className)}
        width={width * devicePixelRatio}
        height={height * devicePixelRatio}
        style={{ width, height, ...style }}
        // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
        role="presentation"
      />
    );
  }
}
