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

import { TooltipValue } from '../../specs';

export interface TooltipInfo {
  header: TooltipValue | null;
  values: TooltipValue[];
}

/** @internal */
export interface TooltipAnchorPosition {
  /**
   * true if the x axis is vertical
   */
  isRotated?: boolean;
  /**
   * the top position of the anchor
   */
  y0?: number;
  /**
   * the bottom position of the anchor
   */
  y1: number;
  /**
   * the right position of anchor
   */
  x0?: number;
  /**
   * the left position of the anchor
   */
  x1: number;
  /**
   * the padding to add between the tooltip position and the final position
   */
  padding?: number;
}
