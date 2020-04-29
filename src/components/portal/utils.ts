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

import { Position } from '../../utils/commons';
import { PopperSettings } from './types';

/** @internal */
export const DEFAULT_POPPER_SETTINGS: PopperSettings = {
  fallbackPlacements: [Position.Right, Position.Left, Position.Top, Position.Bottom],
  placement: Position.Right,
  offset: 10,
};

/**
 * Creates new dom element with given id and attaches to parent
 *
 * @internal
 * */
export function getOrCreateNode(id: string, parent: HTMLElement = document.body): HTMLDivElement {
  const node = document.getElementById(id);
  if (node) {
    return node as HTMLDivElement;
  }

  const newNode = document.createElement('div');
  newNode.id = id;
  parent.appendChild(newNode);
  return newNode;
}
