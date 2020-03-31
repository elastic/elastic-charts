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
import { LegendItem2 } from './types';
import { LegendNode } from './legend_node';

interface Props {
  items: LegendItem2[];
  horizontal: boolean;
}
interface State {
  currentFocus?: string;
  expanded: string[];
}
const KEY_CODES = Object.freeze({
  RETURN: 13,
  SPACE: 32,
  PAGEUP: 33,
  PAGEDOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
});

export class Legend extends React.Component<Props, State> {
  // MOVE TO REDUX
  state = {
    currentFocus: this.props.items[0].id,
    expanded: [],
  };

  // MOVE TO REDUX
  toggleExpand = (id: string) => {
    this.setState(({ expanded, currentFocus }) => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }

      return {
        currentFocus,
        expanded: [...newExpanded.values()],
      };
    });
  };

  onKeyDown = (keyCode: number, id: string) => {
    switch (keyCode) {
      case KEY_CODES.SPACE:
      case KEY_CODES.RETURN:
        this.toggleExpand(id);
        return true;
      case KEY_CODES.DOWN:
        return this.findNextOnTree();
      case KEY_CODES.UP:
        return this.findPrevOnTree();
    }
    return false;
  };

  findNextOnTree = () => {
    return false;
  };
  findPrevOnTree = () => {
    return false;
  };

  render() {
    return (
      <div className="echLegend2Container--horizontal">
        <LegendNode
          items={this.props.items}
          state={this.state}
          toggleExpand={this.toggleExpand}
          changeCurrentFocus={() => ({})}
          onKeyDown={this.onKeyDown}
        />
      </div>
    );
  }
}
