/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import React, { useEffect, useState } from 'react';

import {
  Chart,
  ColumnarViewModel,
  Datum,
  Flame,
  Settings,
  PartialTheme,
  ControlProviderCallback,
} from '@elastic/charts';
import columnarMock from '@elastic/charts/src/mocks/hierarchical/cpu_profile_tree_mock_columnar.json';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';

import { useBaseTheme } from '../../use_base_theme';

const pseudoRandom = getRandomNumberGenerator('a_seed');

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

function generateColorsForLabels(labels: any[]): number[] {
  return labels.flatMap(() => [...paletteColorBrewerCat12[pseudoRandom(0, 11)].map((c) => c / 255), 1]);
}

const largeDataset: ColumnarViewModel = (() => {
  return {
    label: columnarMock.label.map((index: number) => columnarMock.dictionary[index]),
    value: new Float64Array(columnarMock.value),
    color: new Float32Array(generateColorsForLabels(columnarMock.label)),
    position0: new Float32Array(columnarMock.position),
    position1: new Float32Array(columnarMock.position),
    size0: new Float32Array(columnarMock.size),
    size1: new Float32Array(columnarMock.size),
  };
})();

const smallDataset: ColumnarViewModel = (() => {
  const labels = ['root', 'kernel', 'libxul.so', 'libxul.so'];
  const value = [1428, 1428, 1099, 329];
  const position = [0, 0.67, 0, 0.33, 0, 0, 0.769607, 0];
  const size = [1, 1, 0.769607, 0.230393];

  return {
    label: labels,
    value: new Float64Array(value),
    color: new Float32Array(generateColorsForLabels(labels)),
    position0: new Float32Array(position),
    position1: new Float32Array(position),
    size0: new Float32Array(size),
    size1: new Float32Array(size),
  };
})();

export const Example = (
  // should check why it's not a good idea; in the meantime:
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  props?: { controlProviderCallback: ControlProviderCallback },
) => {
  const [columnarData, setColumnarData] = useState(largeDataset);
  const [seconds, setSeconds] = useState(0);

  const onElementListeners = {
    onElementClick: action('onElementClick'),
    onElementOver: action('onElementOver'),
    onElementOut: action('onElementOut'),
  };

  const theme: PartialTheme = {
    chartMargins: { top: 0, left: 0, bottom: 0, right: 0 },
    chartPaddings: { left: 0, right: 0, top: 0, bottom: 0 },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (seconds > 0 && seconds % 10 === 0) {
      if ((seconds / 10) % 2 === 0) {
        setColumnarData(largeDataset);
      } else {
        setColumnarData(smallDataset);
      }
    }
  }, [seconds]);

  return (
    <Chart>
      <Settings theme={theme} baseTheme={useBaseTheme()} {...onElementListeners} />
      <Flame
        id="spec_1"
        columnarData={columnarData}
        valueAccessor={(d: Datum) => d.value as number}
        valueFormatter={(value) => `${value}`}
        animation={{ duration: 500 }}
        controlProviderCallback={props?.controlProviderCallback ?? (() => {})}
      />
    </Chart>
  );
};

Example.parameters = {
  background: { default: 'white' },
};
