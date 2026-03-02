/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { registerMeasureCanvas, unregisterMeasureCanvas } from '../utils/bbox/canvas_text_bbox_calculator';

const canvasStyle: React.CSSProperties = { position: 'absolute', width: 0, height: 0, overflow: 'hidden' };

/**
 * Hidden canvas element that lives in the Chart DOM tree to inherit computed
 * CSS font properties (e.g. font-feature-settings, font-variant-numeric)
 * from ancestors. Used by {@link withTextMeasure} for accurate text measurement.
 * @internal
 */
export class ChartMeasureCanvas extends React.Component {
  private canvasRef = React.createRef<HTMLCanvasElement>();

  componentDidMount() {
    if (this.canvasRef.current) registerMeasureCanvas(this.canvasRef.current);
  }

  componentWillUnmount() {
    if (this.canvasRef.current) unregisterMeasureCanvas(this.canvasRef.current);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <canvas ref={this.canvasRef} width={0} height={0} aria-hidden style={canvasStyle} />;
  }
}
