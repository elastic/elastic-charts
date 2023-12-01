/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { AreaSeries, Axis, Chart, CurveType, Position, ScaleType, Settings } from '@elastic/charts';

import { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

const data = [
  {
    key: 0,
    doc_count: 0,
  },
  {
    key: 107.2871113576205,
    doc_count: 0,
  },
  {
    key: 133,
    doc_count: 169,
  },
  {
    key: 164.87534966839775,
    doc_count: 1984,
  },
  {
    key: 204.39008216749184,
    doc_count: 1376,
  },
  {
    key: 253.37508470765238,
    doc_count: 692,
  },
  {
    key: 314.100042770181,
    doc_count: 287,
  },
  {
    key: 389.378604380393,
    doc_count: 222,
  },
  {
    key: 482.69874850082726,
    doc_count: 564,
  },
  {
    key: 598.3843980719687,
    doc_count: 4045,
  },
  {
    key: 741.7957659265381,
    doc_count: 8143,
  },
  {
    key: 919.5777164637204,
    doc_count: 15190,
  },
  {
    key: 1139.967650746035,
    doc_count: 23055,
  },
  {
    key: 1413.1771806572506,
    doc_count: 15015,
  },
  {
    key: 1751.8652767237954,
    doc_count: 14600,
  },
  {
    key: 2171.7248125696256,
    doc_count: 17494,
  },
  {
    key: 2692.2096831274607,
    doc_count: 13394,
  },
  {
    key: 3337.4361871149363,
    doc_count: 13903,
  },
  {
    key: 4137.300438695783,
    doc_count: 21022,
  },
  {
    key: 5128.863582805883,
    doc_count: 30053,
  },
  {
    key: 6358.068997117526,
    doc_count: 37550,
  },
  {
    key: 7881.871045981584,
    doc_count: 40121,
  },
  {
    key: 9770.874020657398,
    doc_count: 41401,
  },
  {
    key: 12112.60353926129,
    doc_count: 37269,
  },
  {
    key: 15015.56198443892,
    doc_count: 27225,
  },
  {
    key: 18614.255884600516,
    doc_count: 19608,
  },
  {
    key: 23075.428178876242,
    doc_count: 13488,
  },
  {
    key: 28605.7841333851,
    doc_count: 10287,
  },
  {
    key: 35461.56888368852,
    doc_count: 7402,
  },
  {
    key: 43960.44037209106,
    doc_count: 4775,
  },
  {
    key: 54496.18780394934,
    doc_count: 3816,
  },
  {
    key: 67556.97759226183,
    doc_count: 2524,
  },
  {
    key: 83747.97220349085,
    doc_count: 2613,
  },
  {
    key: 103819.3699328557,
    doc_count: 1984,
  },
  {
    key: 128701.16481227305,
    doc_count: 2151,
  },
  {
    key: 159546.2372267188,
    doc_count: 3005,
  },
  {
    key: 197783.77181227363,
    doc_count: 2492,
  },
  {
    key: 245185.47771641501,
    doc_count: 1576,
  },
  {
    key: 303947.67948952696,
    doc_count: 718,
  },
  {
    key: 376793.0822310816,
    doc_count: 453,
  },
  {
    key: 467096.9262066379,
    doc_count: 225,
  },
  {
    key: 579043.3762207008,
    doc_count: 107,
  },
  {
    key: 717819.3919365238,
    doc_count: 63,
  },
  {
    key: 889855.0619871503,
    doc_count: 20,
  },
  {
    key: 1103121.537588911,
    doc_count: 23,
  },
  {
    key: 1367500.3702008445,
    doc_count: 20,
  },
  {
    key: 1695241.366229529,
    doc_count: 21,
  },
  {
    key: 2101530.173153578,
    doc_count: 10,
  },
  {
    key: 2605191.89576981,
    doc_count: 8,
  },
  {
    key: 3229563.3441227335,
    doc_count: 33,
  },
  {
    key: 4003574.3281088388,
    doc_count: 979,
  },
  {
    key: 4963088.099777182,
    doc_count: 2199,
  },
  {
    key: 6152563.051773136,
    doc_count: 965,
  },
  {
    key: 7627112.665548564,
    doc_count: 72,
  },
  {
    key: 9455059.155583354,
    doc_count: 51,
  },
  {
    key: 11721099.130918715,
    doc_count: 64,
  },
  {
    key: 14530227.95269304,
    doc_count: 12,
  },
  {
    key: 18012604.620013494,
    doc_count: 2,
  },
  {
    key: 22329582.59521292,
    doc_count: 2,
  },
  {
    key: 27681186.00251957,
    doc_count: 3,
  },
  {
    key: 34315377.60452156,
    doc_count: 2,
  },
  {
    key: 42539547.981568344,
    doc_count: 13,
  },
  {
    key: 52734758.257117845,
    doc_count: 13,
  },
  {
    key: 65373396.295644514,
    doc_count: 24,
  },
  {
    key: 81041064.46056497,
    doc_count: 28,
  },
  {
    key: 100463713.0859759,
    doc_count: 51,
  },
  {
    key: 124541276.87245026,
    doc_count: 93,
  },
  {
    key: 154389372.72551844,
    doc_count: 183,
  },
  {
    key: 191390991.07672492,
    doc_count: 208,
  },
  {
    key: 237260575.76809216,
    doc_count: 91,
  },
  {
    key: 294123461.59616184,
    doc_count: 6,
  },
  {
    key: 364614350.19809616,
    doc_count: 5,
  },
  {
    key: 451999387.09042615,
    doc_count: 2,
  },
  {
    key: 560327496.2138001,
    doc_count: 0.0001,
  },
  {
    key: 694617983.9629189,
    doc_count: 0,
  },
  {
    key: 861093105.2018316,
    doc_count: 1,
  },
  {
    key: 1067466367.046606,
    doc_count: 0.0001,
  },
  {
    key: 1323299928.7673922,
    doc_count: 0,
  },
  {
    key: 1640447657.681875,
    doc_count: 0,
  },
  {
    key: 2033604369.721831,
    doc_count: 0,
  },
  {
    key: 2520986703.3463764,
    doc_count: 1,
  },
  {
    key: 3125177174.6136513,
    doc_count: 3,
  },
  {
    key: 3874170522.10617,
    doc_count: 1,
  },
  {
    key: 4802670823.362817,
    doc_count: 4,
  },
  {
    key: 5953699483.790642,
    doc_count: 2,
  },
  {
    key: 7380588603.086767,
    doc_count: 2,
  },
  {
    key: 9149452080.394913,
    doc_count: 10,
  },
  {
    key: 11342248955.107962,
    doc_count: 5,
  },
  {
    key: 14060580921.04847,
    doc_count: 3,
  },
  {
    key: 17430399969.162903,
    doc_count: 6,
  },
  {
    key: 21607844284.02827,
    doc_count: 7,
  },
  {
    key: 26786472796.311687,
    doc_count: 9,
  },
  {
    key: 33206233599.059467,
    doc_count: 11,
  },
  {
    key: 41164581773.04837,
    doc_count: 10,
  },
  {
    key: 51030261757.77967,
    doc_count: 13,
  },
  {
    key: 63260392864.53983,
    doc_count: 6,
  },
  {
    key: 78421649576.7008,
    doc_count: 8,
  },
  {
    key: 97216518011.51195,
    doc_count: 4,
  },
  {
    key: 120515845117.98601,
    doc_count: 0.0001,
  },
  {
    key: 149399188754.96533,
    doc_count: 0,
  },
  {
    key: 185204838241.72855,
    doc_count: 0,
  },
];

export const Example: ChartsStory = (_, { title, description }) => {
  return (
    <Chart title={title} description={description} className="story-chart">
      <Settings baseTheme={useBaseTheme()} />
      <Axis id="X" title="index" position={Position.Bottom} />
      <Axis id="Y" position={Position.Left} />

      <AreaSeries
        id="areas"
        xScaleType={ScaleType.Log}
        yScaleType={ScaleType.Log}
        xAccessor="key"
        yAccessors={['doc_count']}
        data={data.map((d) => ({ ...d, doc_count: d.doc_count < 1 ? null : d.doc_count }))}
        curve={CurveType.CURVE_STEP_AFTER}
        tickFormat={(d) => d.toFixed(1)}
      />
    </Chart>
  );
};
