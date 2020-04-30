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
import { getTextColor } from './fill_text_layout';
import { QuadViewModel } from '../types/viewmodel_types';

describe('fill text layout', () => {
  describe('getTextColor', () => {
    it('should return a valid color', () => {
      const textColor = '#000';
      const textInvertible = true;
      const containerBackgroundColor = 'rgba(255, 255, 255, 1)';
      const node: QuadViewModel = {
        strokeWidth: 1,
        strokeStyle: 'white',
        fillColor: 'rgba(228,26,28,0.3)',
        dataName: 'gbr',
        depth: 3,
        sortIndex: 2,
        value: 11714,
        x0: 6.059,
        x1: 6.283,
        y0: 2,
        y0px: 119.666,
        y1: 3,
        y1px: 179.5,
        yMidPx: 149.583,
        parent: {
          // value: 50583,
          // statistics: {},
          // children: [],
          // depth: 2,
          // sortIndex: 2,
          // parent: {},
          // inputIndex: [3, 9, 13],
        },
      };
      expect(getTextColor(textColor, textInvertible, node, containerBackgroundColor)).toEqual('#1b1b1b');
    });
  });
});
