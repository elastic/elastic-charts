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
import {
  makeHighContrastColor,
  combineColors,
  showContrastAmount,
} from '../src/chart_types/partition_chart/layout/utils/calcs';

type PlaygroundState = {
  backgroundColor: string;
  foregroundColor: string;
  textColor: string;
};
export class Playground extends React.Component<{}, PlaygroundState> {
  constructor(props: any) {
    super(props);
    this.state = {
      backgroundColor: 'rgba(113, 128, 172, 0.75)',
      foregroundColor: 'rgba(168, 208, 20, 0.3)',
      textColor: 'rgba(163, 122, 116, 1)',
    };
  }

  updateForegroundColor = (event: any, color: any) => {
    this.setState({
      foregroundColor: color,
    });
  };

  render() {
    const combinedColors = combineColors(this.state.foregroundColor, this.state.backgroundColor);
    const makeContrasted = makeHighContrastColor(this.state.textColor, combinedColors);
    return (
      <form
        className="background"
        style={{
          backgroundColor: this.state.backgroundColor,
          position: 'absolute',
          width: 425,
          height: 500,
          top: 10,
          left: 10,
        }}
      >
        <div
          className="foreground"
          style={{
            backgroundColor: this.state.foregroundColor,
            position: 'absolute',
            width: 200,
            height: 400,
            top: 10,
            left: 200,
          }}
        >
          <label>foreground color input </label>
          <input
            type="color"
            name="foregroundColor"
            value={this.state.foregroundColor}
            onChange={() => (event: any, color: any) => this.updateForegroundColor(event, color)}
          />
          <p
            style={{
              paddingTop: 40,
              paddingBottom: 40,
            }}
          >
            This is the foreground color
            <br />
            <br />
            {this.state.foregroundColor}
          </p>
          <p
            className="text"
            style={{
              color: this.state.textColor,
              padding: 20,
            }}
          >
            Here is the original text color
          </p>
          <label>text color input </label>
          {/* <input type="color" id="favcolor" name="favcolor" value="#ff0000" onChange={} /> */}
          <p
            className="text"
            style={{
              color: makeContrasted,
              padding: 20,
            }}
          >
            Here is some text with contrasted color
          </p>
        </div>
        <div
          className="showCalculations"
          style={{
            position: 'absolute',
            width: 200,
            height: 400,
            top: 40,
            left: 450,
          }}
        >
          <p
            style={{
              paddingBottom: 40,
            }}
          >
            Contrast between original text color and combinedBackground color
            <br />
            <br />
            <b>{showContrastAmount(this.state.textColor, combinedColors).toFixed(3)}</b>
          </p>
          <p>
            Contrast between contrast-computed text color and combinedBackground color
            <br />
            <br />
            <b>{showContrastAmount(makeContrasted, combinedColors).toFixed(3)}</b>
          </p>
        </div>
        <div
          className="combinedforeground"
          style={{
            backgroundColor: combineColors(this.state.foregroundColor, this.state.backgroundColor),
            position: 'absolute',
            width: 200,
            height: 400,
            top: 10,
            left: 700,
          }}
        >
          <p
            style={{
              margin: 'auto',
              padding: 10,
            }}
          >
            This is the combined background and container background
            <br />
            <br />
            {combineColors(this.state.foregroundColor, this.state.backgroundColor)}
          </p>
          {}
        </div>
      </form>
    );
  }
}
