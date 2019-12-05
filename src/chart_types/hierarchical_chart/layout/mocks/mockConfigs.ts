import { Config, EasingFunction, ViewQuery } from '../circline/types/ConfigTypes';
import { tau } from '../circline/utils/math';
import { config } from '../circline/config/config';

const easeInOutCubic: EasingFunction = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

export const easeInCubic: EasingFunction = (t) => t * t * t;

const easeOutCubic: EasingFunction = (t) => {
  const u = 1 - t;
  return 1 - u * u * u;
};

const linear: EasingFunction = (t) => t;

export const pieMockConfig: ViewQuery = {
  name: 'pie',
  factsQuerySQL: `select left(sitc4, 1) as sitc1, sum(export_val) as exportVal
          from tradeflow
         where export_val is not NULL
           and year = '2010'
           and export_val > 100000000
      group by sitc1
        having exportVal <> 0
           and exportVal > 10000000000
         order by exportVal desc`,
  valueField: 'exportVal',
  aggregator: 'sum',
  order: 'descending',
  groupByFields: ['sitc1'],
  dimensions: ['sitc1'],
};
export const manyPieMockConfig: ViewQuery = {
  name: 'manyPie',
  factsQuerySQL: `select origin, sum(export_val) as exportVal
          from tradeflow
         where export_val is not NULL
           and year = '2010'
      group by origin
        having exportVal <> 0
         order by exportVal desc`,
  valueField: 'exportVal',
  aggregator: 'sum',
  order: 'descending',
  groupByFields: ['origin'],
  dimensions: ['countries'],
};
export const sunburstMockConfig: ViewQuery = {
  name: 'sunburst',
  factsQuerySQL: `select left(sitc4, 1) as sitc1, dest, sum(export_val) as exportVal
          from tradeflow
         where export_val is not NULL
           and year = '2010'
           and export_val > 100000000
      group by sitc1, dest
        having exportVal <> 0
           and exportVal > 10000000000
         order by exportVal desc`,
  valueField: 'exportVal',
  aggregator: 'sum',
  order: 'descending',
  groupByFields: ['sitc1', 'dest'],
  dimensions: ['sitc1', 'countries'],
};
const playgroundConfig010 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    outerSizeRatio: 1 - 0.5 * Math.random(),
    emptySizeRatio: 0, //1 - 0.5 * Math.random(),
    maxRowCount: 12,
    minFontSize: 8,
    maxFontSize: 30,
    colors: 'CET2s',
    backgroundColor: 'rgba(255,241,229,1)',
    sectorLineWidth: 1.5,
    fontFamily: "'Fira Sans Extra Condensed', " + config.fontFamily,
    fillLabel: Object.assign({}, config.fillLabel, {
      formatter: (d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
      fontStyle: 'italic',
      fontVariant: 'small-caps',
    }),
  });
const playgroundConfig011 = (): Config =>
  Object.assign({}, playgroundConfig010(), {
    viewQuery: pieMockConfig,
    treemap: 1,
    outerSizeRatio: 0.6,
    straightening: 1,
    circlePadding: 0,
    radialPadding: 0,
    horizontalTextAngleThreshold: 0,
    horizontalTextEnforcer: 1,
    minFontSize: 10,
    maxFontSize: 12,
    fillLabel: Object.assign({}, playgroundConfig010().fillLabel, {}),
    linkLabel: Object.assign({}, playgroundConfig010().linkLabel, {
      maximumSection: 0,
      maxCount: 0,
    }),
  });
const playgroundConfig012 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    outerSizeRatio: 0.66,
    linkLabel: Object.assign({}, config.linkLabel, {
      fontSize: 8 + 9 * Math.random(),
      maximumSection: Infinity,
    }),
    colors: 'turbo',
    backgroundColor: 'rgba(229,241,255,1)',
  });
const playgroundConfig014 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    fillOutside: true,
    radiusOutside: 100 + 80 * Math.random(),
    // fillRectangleWidth: 960,
    // fillRectangleHeight: 480,
    maxFontSize: 16,
    outerSizeRatio: 0.66,
    colors: 'CET2s',
    backgroundColor: 'rgba(241,255,229,1)',
  });
const playgroundConfig020 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    emptySizeRatio: 0.1 + 0.1 * Math.random(),
    backgroundColor: 'rgba(241,229,255,1)',
  });
const playgroundConfig030 = (): Config =>
  Object.assign({}, config, {
    viewQuery: sunburstMockConfig,
    width: 960,
    height: 480,
    colors: ['CET2s', 'turbo'][Math.floor(2 * Math.random())],
    linkLabel: Object.assign({}, config.linkLabel, {
      maxCount: 32,
      fontSize: 14,
    }),
    fillLabel: Object.assign({}, config.fillLabel, {
      formatter: (d: number) => `$${config.fillLabel.formatter(Math.round(d / 1000000000))}\xa0Bn`,
      fontStyle: 'italic',
    }),
    margin: Object.assign({}, config.margin, { top: 0.1 }),
    minFontSize: 1,
    idealFontSizeJump: 1.1,
    emptySizeRatio: 0,
    outerSizeRatio: 0.8, // - 0.5 * Math.random(),
    backgroundColor: 'rgba(229,229,229,1)',
  });
const playgroundConfig040 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    fillOutside: true,
    radiusOutside: 140,
    emptySizeRatio: 0.4,
    outerSizeRatio: 0.5 - 0.25 * Math.random(),
    sectorLineWidth: 2,
    colors: 'turbo',
    backgroundColor: 'rgba(229,229,255,0.5)',
    /*
    linkLabel: Object.assign({}, config.linkLabel, {
      maximumSection: Infinity,
    }),
*/
  });
const playgroundConfig050 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    emptySizeRatio: 0.8,
    outerSizeRatio: 1 - 0.8 * Math.random(),
    sectorLineWidth: 3,
    linkLabel: Object.assign({}, config.linkLabel, {
      maximumSection: Infinity,
      fontSize: 17,
    }),
    colors: 'turbo',
    backgroundColor: 'rgba(229,241,255,0)',
  });
const playgroundConfig060 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    outerSizeRatio: 1 - 0.5 * Math.random(),
    colors: ['CET2s', 'turbo'][Math.floor(2 * Math.random())],
    sectorLineWidth: 1.5,
    fillLabel: Object.assign({}, config.fillLabel, { textColor: '#ffffff' }),
    linkLabel: Object.assign({}, config.linkLabel, {
      textColor: '#ffffff',
      lineWidth: 2,
      fontSize: 16,
    }),
    backgroundColor: [
      '#000000', //'black',
      '#808080', //'grey',
      '#000080', //'navy',
      '#2F4F4F', //'darkslategrey',
      '#800000', //'maroon',
      '#4B0082', //'indigo',
      '#483D8B', //'darkslateblue',
    ][Math.floor(5 * Math.random())],
  });
const playgroundConfig100 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    emptySizeRatio: 0.1,
    outerSizeRatio: 0.7,
    fontFamily: 'Arial',
    minFontSize: 1.4927064362185567,
    maxFontSize: 9.436958702032186,
    idealFontSizeJump: 1.1558794800065706,
    circlePadding: 0.6980902648882326,
    radialPadding: 0.0266864756537456,
    maxRowCount: 13.374632939687356,
    fillOutside: false,
    radiusOutside: 364.5166088338115,
    fillRectangleWidth: null,
    fillRectangleHeight: null,
    fillLabel: Object.assign({}, config.fillLabel, {
      textColor: '#000000',
    }),
    linkLabel: Object.assign({}, config.linkLabel, {
      fontSize: 12,
      gap: 10,
      spacing: 4.126938530972531,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 1,
      maxCount: 15,
      textColor: '#000000',
    }),
    backgroundColor: 'rgba(255,241,229,1)',
    sectorLineWidth: 0.7555559372090592,
    colors: 'CET2s',
  });
const playgroundConfig110 = (): Config =>
  Object.assign({}, config, {
    viewQuery: manyPieMockConfig,
    width: 960,
    height: 480,
    emptySizeRatio: 0,
    outerSizeRatio: 0.8,
    minFontSize: 1,
    maxFontSize: 64,
    idealFontSizeJump: 1.1,
    fillOutside: false,
    linkLabel: Object.assign({}, config.linkLabel, {
      fontSize: 10,
      gap: 10,
      spacing: 0,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 1,
      maxCount: 15,
      textColor: '#000000',
    }),
    backgroundColor: 'rgba(255,2255,255,1)',
    sectorLineWidth: 1,
    colors: 'CET2s',
  });
const playgroundConfig120 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    margin: { left: -40, right: 0, top: 0, bottom: 0 },
    outerSizeRatio: 80,
    emptySizeRatio: 0.998,
    specialFirstInnermostSector: false,
    clockwiseSectors: false,
    horizontalTextAngleThreshold: 0,
    horizontalTextEnforcer: 1,
    fontFamily: 'Arial',
    minFontSize: 5,
    maxFontSize: 10,
    idealFontSizeJump: 1.05,
    circlePadding: 0,
    radialPadding: 0,
    maxRowCount: 12,
    fillOutside: false,
    radiusOutside: 128,
    fillLabel: Object.assign({}, config.fillLabel, { textColor: '#000000' }),
    backgroundColor: 'rgb(255,255,255)',
    sectorLineWidth: 0,
    colors: 'CET2s',
    rotation: 0, // 2,
    fromAngle: 1.56,
    toAngle: 1.5767689364024815,
    maximumSection: 0,
    left: -5.5479802283961135,
    lineWidth: 0,
    fontSize: 4,
    linkLabel: Object.assign({}, config.linkLabel, {
      maximumSection: 20,
      fontSize: 7,
      gap: 10,
      spacing: 0,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 0.17042344395883569,
      maxCount: 36,
      textColor: '#000000',
      minimumStemLength: 0,
      stemAngle: 0.7853981633974483,
    }),
  });
const playgroundConfig130 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 960,
    height: 480,
    margin: { left: 0, right: 0, top: 0, bottom: -100 },
    outerSizeRatio: 50,
    emptySizeRatio: 0.9983,
    rotation: 0.0005,
    fromAngle: 1.56 + (3 * Math.PI) / 2,
    toAngle: 1.5767689364024815 + (3 * Math.PI) / 2,
    specialFirstInnermostSector: false,
    clockwiseSectors: true,
    horizontalTextAngleThreshold: 0,
    horizontalTextEnforcer: 1,
    fontFamily: 'Arial',
    minFontSize: 8,
    maxFontSize: 16,
    idealFontSizeJump: 1.05,
    circlePadding: 0,
    radialPadding: 0,
    maxRowCount: 12,
    fillOutside: false,
    radiusOutside: 128,
    fillLabel: Object.assign({}, config.fillLabel, { textColor: '#000000' }),
    backgroundColor: 'rgb(255,255,255)',
    sectorLineWidth: 0,
    colors: 'CET2s',
    maximumSection: 0,
    left: -5.5479802283961135,
    lineWidth: 0,
    fontSize: 4,
    linkLabel: Object.assign({}, config.linkLabel, {
      maximumSection: 20,
      fontSize: 12,
      gap: 10,
      spacing: 0,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 0.17042344395883569,
      maxCount: 36,
      textColor: '#000000',
      minimumStemLength: 0,
      stemAngle: 0.7853981633974483,
    }),
  });
const playgroundConfig140 = (): Config =>
  Object.assign({}, playgroundConfig130(), {
    margin: { left: 0, right: 0, top: -100, bottom: 0 },
    rotation: 0.008,
    fromAngle: 1.56 + Math.PI / 2,
    toAngle: 1.5767689364024815 + Math.PI / 2,
    clockwiseSectors: false,
  });
const playgroundConfig150 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 1200,
    height: 480,
    minFontSize: 14,
    margin: { left: 0, right: 0, top: 0, bottom: 0 },
    outerSizeRatio: 0.3,
    emptySizeRatio: 0.8,
    specialFirstInnermostSector: false,
    clockwiseSectors: true,
    colors: 'CET2s',
    straightening: 1,
    shear: -32,
    maximumSection: 0,
    sectorLineWidth: 1,
    circlePadding: 0,
    radialPadding: 0,
    rotation: 0,
    horizontalTextAngleThreshold: 0,
    linkLabel: Object.assign({}, config.linkLabel, {
      maximumSection: 1000,
      fontSize: 12,
      gap: 10,
      spacing: 0,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 0.17042344395883569,
      maxCount: 36,
      textColor: '#000000',
      minimumStemLength: 0,
      stemAngle: 0.7853981633974483,
    }),
  });
const playgroundConfig200 = (): Config =>
  Object.assign({}, playgroundConfig130(), {
    viewQuery: sunburstMockConfig,
    treemap: 0.99,
    emptySizeRatio: 0.985,
    outerSizeRatio: 50.8,
    margin: { left: 0, right: 0, top: -100, bottom: 0 },
    rotation: 0.008,
    fromAngle: 1.544 + Math.PI / 2,
    toAngle: 1.5819689364024815 + Math.PI / 2,
    clockwiseSectors: false,
    sectorLineWidth: 0,
    minFontSize: 1,
    maxFontSize: 64,
    colors: 'CET2s',
    //idealFontSizeJump: 1.02,
    linkLabel: Object.assign({}, playgroundConfig130().linkLabel, {
      maxCount: 0,
      maximumSection: 0,
    }),
  }) ||
  Object.assign({}, config, {
    width: 960,
    height: 480,
    outerSizeRatio: 0.5,
    straightening: 0.5,
    treemap: 1,
    clockwiseSectors: false,
    specialFirstInnermostSector: false,
    horizontalTextAngleThreshold: 0,
    horizontalTextEnforcer: 1,
    linkLabel: Object.assign({}, config.linkLabel, {
      fontSize: 12,
      maximumSection: 0,
    }),
    colors: 'turbo',
  });
const playgroundConfig201 = (): Config =>
  Object.assign({}, playgroundConfig200(), {
    treemap: 1,
  });
const playgroundConfig160 = (): Config =>
  Object.assign({}, playgroundConfig150(), {
    emptySizeRatio: 0,
    colors: 'CET2s',
    straightening: 0,
    shear: 0,
    linkLabel: Object.assign({}, playgroundConfig150().linkLabel, { radiusPadding: 7 }),
    animation: {
      duration: 0.3,
      keyframes: [
        {
          time: 300,
          easingFunction: easeInOutCubic,
          keyframeConfig: {},
        },
        {
          time: 50,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            emptySizeRatio: 0.8,
          },
        },
        //        { time: 150, easingFunction: easeInOutCubic, keyframeConfig: {} },
        {
          time: 150,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            straightening: 1,
          },
        },
        {
          time: 100,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            shear: -32,
            margin: { top: 0.2 },
          },
        },
        {
          time: 50,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            linkLabel: { textOpacity: 0 },
          },
        },
        {
          time: 100,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            collapse: 1,
            margin: { right: 0.37 },
          },
        },
        {
          time: 100,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            // emptySizeRatio: 0.6,
            linkLabel: { maximumSection: 0 },
            minFontSize: 5,
          },
        },
        {
          time: 25,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            linkLabel: { textOpacity: 1 },
          },
        },
        {
          time: 1000,
          easingFunction: easeInOutCubic,
          keyframeConfig: {},
        },
      ],
    },
  });
const playgroundConfig170 = (): Config =>
  Object.assign({}, playgroundConfig150(), {
    emptySizeRatio: 0.7,
    colors: 'CET2s',
    straightening: 0,
    shear: 0,
    linkLabel: Object.assign({}, playgroundConfig150().linkLabel, {
      radiusPadding: 7,
      minFontSize: 5,
    }),
    animation: {
      duration: 1,
      keyframes: [
        {
          time: 1000,
          easingFunction: easeInOutCubic,
          keyframeConfig: {},
        },
        {
          time: 400,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            // emptySizeRatio: 0.8,
            straightening: 1,
            shear: -32,
            collapse: 1,
            margin: { right: 0.27, top: 0.3 },
            linkLabel: { textOpacity: 0, maximumSection: 0 },
          },
        },
        {
          time: 100,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            linkLabel: { textOpacity: 1 },
          },
        },
      ],
    },
  });
const playgroundConfig180 = (): Config =>
  Object.assign({}, playgroundConfig150(), {
    treemap: 1,
    emptySizeRatio: 0,
    outerSizeRatio: 0.6,
    colors: 'CET2s',
    straightening: 1,
    shear: 0,
    minFontSize: 1,
    maxFontSize: 64,
    radialPadding: 0,
    linkLabel: Object.assign({}, playgroundConfig150().linkLabel, {
      maximumSection: 0,
      maxCount: 0,
    }),
    animation: {
      duration: 0.5,
      keyframes: [
        {
          time: 1000,
          easingFunction: easeInCubic,
          keyframeConfig: {},
        },
        {
          time: 100,
          easingFunction: linear,
          keyframeConfig: {
            linkLabel: { textOpacity: 0 },
          },
        },
        {
          time: 400,
          easingFunction: easeInOutCubic,
          keyframeConfig: Object.assign({}, playgroundConfig150(), {
            treemap: 0,
            emptySizeRatio: 0,
            colors: 'CET2s',
            straightening: 0,
            shear: 0,
            linkLabel: Object.assign({}, playgroundConfig150().linkLabel, {
              radiusPadding: 7,
              textOpacity: 0,
            }),
          }),
        },
        {
          time: 150,
          easingFunction: linear,
          keyframeConfig: {
            linkLabel: { textOpacity: 1 },
          },
        },
        {
          time: 1000,
          easingFunction: easeInCubic,
          keyframeConfig: {},
        },
        /*        {
          time: 450,
          easingFunction: easeInCubic,
          keyframeConfig: {
            //emptySizeRatio: 0.8,
            straightening: 1,
          },
        },*/
        /*
        {
          time: 600,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            straightening: 1,
          },
        },
*/
        {
          time: 300,
          easingFunction: easeInOutCubic,
          keyframeConfig: {
            emptySizeRatio: 0.7,
            linkLabel: { textOpacity: 0.5 },
            straightening: 1,
            shear: -32,
            margin: { right: 0.15, top: 0.15 },
          },
        },
        {
          time: 150,
          easingFunction: easeOutCubic,
          keyframeConfig: {
            linkLabel: { textOpacity: 0 },
            collapse: 1,
            margin: { right: 0.3, top: 0.3 },
          },
        },
        {
          time: 50,
          easingFunction: linear,
          keyframeConfig: {
            linkLabel: { textOpacity: 1 },
          },
        },
        /*        {

                  time: 500,
                  easingFunction: linear,
                  keyframeConfig: { linkLabel: { maximumSection: 1e6 } },
                },
                { time: 500, easingFunction: linear, keyframeConfig: playgroundConfig200() },
        */
      ],
    },
  });
const playgroundConfig190 = (): Config =>
  Object.assign({}, playgroundConfig150(), {
    emptySizeRatio: 0,
    colors: 'CET2s',
    straightening: 0,
    shear: 0,
    linkLabel: Object.assign({}, playgroundConfig150().linkLabel, { radiusPadding: 7 }),
  });
const playgroundConfig195 = (): Config =>
  Object.assign({}, config, {
    viewQuery: pieMockConfig,
    width: 1200,
    height: 480,
    minFontSize: 14,
    margin: { left: 0, right: 0, top: 0, bottom: 0 },
    outerSizeRatio: 0.25,
    emptySizeRatio: 0.1,
    specialFirstInnermostSector: false,
    clockwiseSectors: true,
    colors: 'CET2s',
    straightening: 0,
    shear: 17,
    collapse: 0.41,
    maximumSection: 0,
    sectorLineWidth: 1,
    circlePadding: 0,
    radialPadding: 0,
    fromAngle: 0.00001,
    toAngle: tau - 0.00001,
    rotation: 0.8658956684419019,
    horizontalTextAngleThreshold: 0,
    linkLabel: Object.assign({}, config.linkLabel, {
      maximumSection: 1000,
      fontSize: 12,
      gap: 10,
      spacing: 0,
      horizontalStemLength: 10,
      radiusPadding: 10,
      lineWidth: 0.17042344395883569,
      maxCount: 36,
      textColor: '#000000',
      minimumStemLength: 0,
      stemAngle: 0.7853981633974483,
    }),
  });
// prettier-ignore
export const playgroundConfigs = [
  { name: 'Pie', config: playgroundConfig010() },
  { name: 'Treemap1L', config: playgroundConfig011() },
  { name: 'LinkedPie', config: playgroundConfig012() },
  { name: 'Donut', config: playgroundConfig020() },
  { name: 'LinkedDonut', config: playgroundConfig050() },
  { name: 'Sunburst', config: playgroundConfig030() },
  { name: 'OutsideFilledDonut', config: playgroundConfig040() },
  { name: 'DarkModePie', config: playgroundConfig060() },
  { name: 'OutsideFilledPie', config: playgroundConfig014() },
  { name: 'Pie', config: playgroundConfig010() },
  { name: 'LinkedPie', config: playgroundConfig012() },
  { name: 'Donut', config: playgroundConfig020() },
  { name: 'LinkedDonut', config: playgroundConfig050() },
  { name: 'MiniSunburst', config: playgroundConfig030() },
  { name: 'OutsideFilledDonut', config: playgroundConfig040() },
  { name: 'DarkModePie', config: playgroundConfig060() },
  { name: 'OutsideFilledPie', config: playgroundConfig014() },
  { name: 'Pie', config: playgroundConfig010() },
  { name: 'Treemap99', config: playgroundConfig200() },
  { name: 'Treemap100', config: playgroundConfig201() },
  { name: 'Donut', config: playgroundConfig020() },
  { name: 'LinkedDonut', config: playgroundConfig050() },
  { name: 'StackedHorizBarTop', config: playgroundConfig130() },
  { name: 'StackedHorizBarBottom', config: playgroundConfig140() },
  { name: 'StackedBar', config: playgroundConfig120() },
  { name: 'BarToPie', config: playgroundConfig150() },
  { name: 'KeyframeAnim', config: playgroundConfig160() },
  { name: 'KeyframeAnimQuick', config: playgroundConfig170() },
  { name: 'KeyframeAnimBalanced', config: playgroundConfig180() },
  { name: 'DetailPlusAggregate', config: playgroundConfig190() },
  { name: 'Exploded', config: playgroundConfig195() },
  { name: 'ManyPies', config: playgroundConfig110() },
  { name: 'TestPie', config: playgroundConfig100() },
];
