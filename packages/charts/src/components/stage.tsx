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
import type { Painter, RendererType } from '../renderers/painter';
import { SvgPainter } from '../renderers/svg/painter';
import { svgNodesToReact } from '../renderers/svg/to_react';
import type { StageElement } from '../state/internal_chart_renderer';

/** @internal */
export interface StageProps {
  renderer: RendererType;
  /** CSS pixel size of the stage */
  width: number;
  height: number;
  /** used by the canvas backend only: SVG is resolution independent */
  devicePixelRatio: number;
  /** the inherited writing direction of the text drawn on the stage */
  dir?: 'ltr' | 'rtl';
  /** makes the ids of SVG defs unique on the page: the chart id plus a name for the stage */
  idPrefix: string;
  /** the chart's stage element, a `<canvas>` or an `<svg>` */
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
 * The drawing surface of a chart: a `<canvas>` painted imperatively after each commit, or an
 * `<svg>` whose children are produced during render by replaying the same `paint` function into
 * an `SvgPainter`. Chart types only supply `paint`.
 *
 * Both elements share the `echCanvasRenderer` placement; the SVG one adds `echSvgRenderer`,
 * which clips overflow (a canvas discards what lies outside its bitmap) and disables pointer
 * events (hit testing goes through the pointer container and geometry picking).
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
    if (this.props.renderer === 'canvas') this.paintCanvas();
    this.props.onRendered?.();
  }

  private paintCanvas() {
    const element = this.props.forwardStageRef.current;
    const ctx = element instanceof HTMLCanvasElement ? element.getContext('2d') : null;
    if (!ctx) return;
    if (ctx !== this.canvasContext || !this.canvasPainter) {
      this.canvasContext = ctx;
      this.canvasPainter = new CanvasPainter(ctx);
    }
    this.canvasPainter.begin(this.props.devicePixelRatio);
    this.props.paint(this.canvasPainter);
  }

  render() {
    const { renderer, width, height, devicePixelRatio, dir, idPrefix } = this.props;
    const { forwardStageRef, className, style, paint } = this.props;

    if (renderer === 'svg') {
      const painter = new SvgPainter({ width, height, idPrefix, direction: dir });
      paint(painter);
      return (
        <svg
          ref={forwardStageRef as RefObject<SVGSVGElement>}
          className={classNames('echCanvasRenderer', 'echSvgRenderer', className)}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width, height, direction: dir, ...style }}
          // canvas's miter limit default, inherited by every stroke
          strokeMiterlimit={10}
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          {svgNodesToReact(painter.nodes())}
        </svg>
      );
    }

    return (
      <canvas
        dir={dir}
        ref={forwardStageRef as RefObject<HTMLCanvasElement>}
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
