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

interface Props {
  depth?: number;
  items: LegendItem2[];
  state: {
    currentFocus: string;
    expanded: string[];
  };
  changeCurrentFocus: (id: string) => void;
  toggleExpand: (id: string) => void;
  onKeyDown: (keyCode: number, id: string) => boolean;
}

export class LegendNode extends React.Component<Props> {
  toggleExpand = (id: string) => {
    return () => {
      this.props.toggleExpand(id);
    };
  };
  keyDown = (id: string) => {
    return (e: React.KeyboardEvent) => {
      const prevent = this.props.onKeyDown(e.keyCode, id);
      if (prevent) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  };
  renderItem = (item: LegendItem2) => {
    return <button onClick={this.toggleExpand(item.id)}>{item.label}</button>;
  };
  render() {
    const currentDepth = this.props.depth ?? 0;
    return (
      <ul role={currentDepth === 0 ? 'tree' : 'group'} className="echLegend2">
        {this.props.items.map((item, index) => {
          return (
            <li
              key={index}
              role="treeitem"
              className="echLegend2Item"
              onKeyDown={this.keyDown(item.id)}
              aria-expanded={item.children.length > 0 && this.props.state.expanded.indexOf(item.id) > -1 ? true : false}
              tabIndex={this.props.state.currentFocus === item.id ? 0 : -1}
            >
              {this.renderItem(item)}
              {item.children.length > 0 && (
                <LegendNode {...this.props} items={item.children} depth={currentDepth + 1} />
              )}
            </li>
          );
        })}
      </ul>
    );
  }
}
