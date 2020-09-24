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
 * under the License.
 */

import { GeometryValue } from '../../utils/geometry';

/** @internal */
export interface DebugStateAxis {
  id: string;
  title?: string;
  labels: string[];
  values: any[];
}

/** @internal */
export interface DebugStateLegendItem {
  key: string;
  name: string;
  color: string;
}

interface DebugStateLegend {
  items: DebugStateLegendItem[];
}

interface DebugStateBase {
  key: string;
  name: string;
  color: string;
}

/** @internal */
export type DebugStateValue = Pick<GeometryValue, 'x' | 'y' | 'mark'>;

interface DebugStateLineConfig {
  visible: boolean;
  path: string;
  points: DebugStateValue[];
  visiblePoints: boolean;
}

interface DebugStateLine extends DebugStateBase, DebugStateLineConfig {}

type DebugStateArea = Omit<DebugStateLine, 'points' | 'visiblePoints'> & {
  path: string;
  lines: {
    y0?: DebugStateLineConfig;
    y1: DebugStateLineConfig;
  };
};

type DebugStateBar = DebugStateBase & {
  visible: boolean;
  bars: DebugStateValue[];
};

/**
 * Describes _visible_ chart state for use in functional tests
 */
export interface DebugState {
  legend: DebugStateLegend;
  axes: {
    x: DebugStateAxis[];
    y: DebugStateAxis[];
  };
  areas: DebugStateArea[];
  lines: DebugStateLine[];
  bars: DebugStateBar[];
}
