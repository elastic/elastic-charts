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
import { ScaleBand } from '../../../scales/scale_band';
import { Point } from '../../../utils/point';

export interface PerPanelMap {
  panelAnchor: Point;
  horizontalValue: any;
  verticalValue: any;
}
export function perPanelMap<T>(
  horizontalPanelScale: ScaleBand,
  verticalPanelScale: ScaleBand,
  fn: (panelAnchor: Point, horizontalValue: any, verticalValue: any) => T | null,
): Array<T & PerPanelMap> {
  return verticalPanelScale.domain.reduce<Array<T & PerPanelMap>>((acc, verticalValue) => {
    return [
      ...acc,
      ...horizontalPanelScale.domain.reduce<Array<T & PerPanelMap>>((hAcc, horizontalValue) => {
        const panelAnchor: Point = {
          x: horizontalPanelScale.scale(horizontalValue) ?? 0,
          y: verticalPanelScale.scale(verticalValue) ?? 0,
        };
        const fnObj = fn(panelAnchor, horizontalValue, verticalValue);
        if (!fnObj) {
          return hAcc;
        }
        return [
          ...hAcc,
          {
            panelAnchor,
            horizontalValue,
            verticalValue,
            ...fnObj,
          },
        ];
      }, []),
    ];
  }, []);
}
