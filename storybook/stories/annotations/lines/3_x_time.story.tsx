/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  AnnotationDomainType,
  Axis,
  BarSeries,
  Chart,
  LineAnnotation,
  LineAnnotationDatum,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';
import { Position } from '@elastic/charts/src/utils/common';
import { KIBANA_METRICS } from '@elastic/charts/src/utils/data_samples/test_dataset_kibana';

import { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { getDebugStateLogger } from '../../utils/debug_state_logger';
import { customKnobs } from '../../utils/knobs';

const dateFormatter = timeFormatter('HH:mm:ss');

function generateTimeAnnotationData(values: any[]): LineAnnotationDatum[] {
  return values.map((value, index) => ({
    dataValue: value,
    details: `detail-${index}`,
    header: dateFormatter(value),
  }));
}

export const Example: ChartsStory = (_, { title, description }) => {
  const debug = boolean('debug', false);
  const debugState = boolean('Enable debug state', false);
  const markerPosition = select(
    'marker position',
    [Position.Top, Position.Left, Position.Bottom, Position.Right, 'undefined'],
    'undefined',
  );
  const rotation = customKnobs.enum.rotation();

  const dataValues = generateTimeAnnotationData([
    1551438150000, 1551438180000, 1551438390000, 1551438450000, 1551438480000,
  ]);

  return (
    <Chart title={title} description={description}>
      <Settings
        debug={debug}
        onRenderChange={getDebugStateLogger(debugState)}
        debugState={debugState}
        rotation={rotation}
        baseTheme={useBaseTheme()}
      />
      <LineAnnotation
        id="annotation_1"
        domainType={AnnotationDomainType.XDomain}
        dataValues={dataValues}
        marker={<Icon type="alert" />}
        markerPosition={markerPosition === 'undefined' ? undefined : markerPosition}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" tickFormat={dateFormatter} />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      <BarSeries
        id="bars"
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={0}
        yAccessors={[1]}
        data={KIBANA_METRICS.metrics.kibana_os_load.v1.data.slice(0, 20)}
      />
    </Chart>
  );
};
