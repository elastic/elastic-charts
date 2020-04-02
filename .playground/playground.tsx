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

import { Delaunay } from 'd3-delaunay';
import { getRandomNumberGenerator } from '../src/mocks/utils';

export class Playground extends React.Component<{}, { ready: boolean }> {
  private readonly canvasRef: React.RefObject<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null;
  private delaunay: Delaunay<any> | null;
  private points: number[][] = [];

  constructor(props: any) {
    super(props);
    this.canvasRef = React.createRef();
    this.ctx = null;
    this.delaunay = null;

    this.state = { ready: false };
  }

  componentDidMount() {
    if (!this.ctx) {
      this.tryCanvasContext();
      this.setState({ ready: true });
    }
  }

  tryCanvasContext() {
    const canvas = this.canvasRef.current;
    const ctx = canvas && canvas.getContext('2d');

    if (ctx) {
      const rng = getRandomNumberGenerator();
      this.ctx = ctx;

      this.points = new Array(10).fill(1).map(() => [rng(0, 100), rng(0, 100)]);
      console.table(this.points);

      this.delaunay = Delaunay.from(this.points);
      const triangulation = this.delaunay.voronoi();

      this.ctx.beginPath();
      triangulation.render(this.ctx);
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'blue';
      this.ctx.stroke();
    }
  }

  handleHover = (event: React.MouseEvent) => {
    if (this.delaunay) {
      const index = this.delaunay.find(event.nativeEvent.offsetX, event.nativeEvent.offsetY);

      console.log(this.points[index]);
    }
  };

  render() {
    return (
      <>
        <div className="chart">
          <canvas
            onMouseMove={this.handleHover}
            style={{
              height: '100%',
              width: '100%',
            }}
            ref={this.canvasRef}
          ></canvas>
        </div>
      </>
    );
  }
}
