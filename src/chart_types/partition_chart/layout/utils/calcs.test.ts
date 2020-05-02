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

import { makeHighContrastColor } from './calcs';

describe('calcs', () => {
  describe('makeHighContrastColor', () => {
    // test inputs
    it('hex input - should change white text to black when background is white', () => {
      const expected = '#000';
      const result = makeHighContrastColor('#fff', '#fff');
      expect(result).toEqual(expected);
    });
    it('rgb input - should change white text to black when background is white ', () => {
      const expected = '#000';
      const result = makeHighContrastColor('rgb(255, 255, 255)', 'rgb(255, 255, 255)');
      expect(result).toEqual(expected);
    });
    it('rgba input - should change white text to black when background is white ', () => {
      const expected = '#000';
      const result = makeHighContrastColor('rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)');
      expect(result).toEqual(expected);
    });
    it('word input - should change white text to black when background is white ', () => {
      const expected = '#000';
      const result = makeHighContrastColor('white', 'white');
      expect(result).toEqual(expected);
    });
    // test contrast computation
    it('should provide at least 4.5 contrast', () => {
      const foreground = '#fff'; // white
      const background = 'rgba(255, 255, 51, 0.3)'; // light yellow
      const result = '#000'; // black
      expect(result).toEqual(makeHighContrastColor(foreground, background));
    });
  });
  // describe('combineColors', () => {
  // it('should return correct RGBA tuple with opacity greater than 0.7', () => {
  //   const expected = [13, 5, 35, 1];
  //   const result = combineColors('rgba(121, 47, 249, 0.8)', '#1c1c24');
  //   expect(result).toEqual(expected);
  // });
  // it('should return correct RGBA tuple with opacity less than 0.7', () => {
  //   const expected = [227, 141, 142, 0.51];
  //   const result = combineColors('rgba(228, 26, 28, 0.3)', 'rgba(225, 255, 255, 1)');
  //   expect(result).toEqual(expected);
  // });
  // });
});
