/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, button, text } from '@storybook/addon-knobs';
import React from 'react';

import {
  Chart,
  Datum,
  Flame,
  Settings,
  FlameGlobalControl,
  FlameNodeControl,
  ColumnarViewModel,
  FlameSearchControl,
} from '@elastic/charts';
import columnarMock from '@elastic/charts/src/mocks/hierarchical/cpu_profile_tree_mock_columnar.json';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';

const position = new Float32Array(columnarMock.position);
const size = new Float32Array(columnarMock.size);

const rng = getRandomNumberGenerator();

const paletteColorBrewerCat12 = [
  [141, 211, 199],
  [255, 255, 179],
  [190, 186, 218],
  [251, 128, 114],
  [128, 177, 211],
  [253, 180, 98],
  [179, 222, 105],
  [252, 205, 229],
  [217, 217, 217],
  [188, 128, 189],
  [204, 235, 197],
  [255, 237, 111],
];

const columnarData: ColumnarViewModel = {
  label: columnarMock.label.map((index: number) => columnarMock.dictionary[index]), // reversing the dictionary encoding
  value: new Float64Array(columnarMock.value),
  // color: new Float32Array((columnarMock.color.match(/.{2}/g) ?? []).map((hex: string) => Number.parseInt(hex, 16) / 255)),
  color: new Float32Array(
    columnarMock.label.flatMap(() => [...paletteColorBrewerCat12[rng(0, 11)].map((c) => c / 255), 1]),
  ),
  position0: position.map((p, i) => (i % 2 === 0 ? 1 - p - size[i / 2] : p)), //.map((p, i) => (i % 2 === 0 ? 1 - p - size[i / 2] : p)), // new Float32Array([...position].slice(1)), // try with the wrong array length
  position1: position,
  size0: size.map((s) => 0.8 * s),
  size1: size,
};

const noop = () => {};

export const Example = () => {
  let resetFocusControl: FlameGlobalControl = noop; // initial value
  let focusOnNodeControl: FlameNodeControl = noop; // initial value
  let searchText: FlameSearchControl = noop; // initial value

  const onElementListeners = {
    onElementClick: action('onElementClick'),
    onElementOver: action('onElementOver'),
    onElementOut: action('onElementOut'),
  };
  button('Reset focus', () => {
    resetFocusControl();
  });
  button('Set focus on random node', () => {
    focusOnNodeControl(rng(0, 19));
  });
  const textSearch = text('Text to search', 'github');
  button('Search', () => {
    searchText(textSearch);
  });
  const debug = boolean('Debug history', false);
  return (
    <Chart>
      <Settings baseTheme={useBaseTheme()} {...onElementListeners} debug={debug} />
      <Flame
        id="spec_1"
        columnarData={columnarData}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={(value) => `${value}`}
        animation={{ duration: 500 }}
        controlProviderCallback={{
          resetFocus: (control) => (resetFocusControl = control),
          focusOnNode: (control) => (focusOnNodeControl = control),
          search: (control) => (searchText = control),
        }}
      />
    </Chart>
  );
};
