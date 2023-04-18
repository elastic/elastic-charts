/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { color, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Chart, Settings, Wordcloud, FontStyle, WordcloudSpec, Color, WordCloudElementEvent } from '@elastic/charts';
import { WeightFn, WordModel } from '@elastic/charts/src/chart_types/wordcloud/layout/types/viewmodel_types';
import { getRandomNumberGenerator } from '@elastic/charts/src/mocks/utils';
import { palettes as euiPalettes } from '@elastic/charts/src/utils/themes/colors';

import { useBaseTheme } from '../../use_base_theme';

const text =
  'Webtwo ipsum sifteo twones chegg lijit meevee spotify, joukuu wakoopa greplin. Sclipo octopart wufoo, balihoo. Kiko groupon fleck revver blyve joyent dogster, zoodles zooomr scribd dogster mog. Zinch orkut jabber trulia, sclipo. Chumby imvu rovio ning zoho akismet napster, kippt zillow mzinga zoho. ' +
  'Zoho cotweet cloudera zinch spock divvyshot edmodo convore, geni palantir geni woopra divvyshot. Zoho imeem convore orkut oooj foodzie airbnb, jabber rovio klout spotify dropio. Insala octopart wikia xobni airbnb quora mzinga elgg, mog quora blekko boxbe plickers zlio. Sococo chumby trulia ebay sococo zoho lijit, spock nuvvo omgpop heekya koofers. Kazaa voki chegg napster mozy koofers, meebo heroku empressr foodzie. ' +
  // 'Meevee movity fleck waze palantir glogster ebay, scribd chegg zinch spotify. Zinch vimeo joukuu insala jaiku squidoo, kaboodle quora shopify. Imeem plickers zapier ning eskobo movity omgpop zillow, voxy knewton napster kippt quora gooru. Whrrl chegg klout hulu greplin, dogster balihoo yuntaa. Oovoo ebay kosmix eduvant meebo ning, akismet zapier meevee. Oooooc blekko cotweet nuvvo sclipo zinch movity kaboodle, zooomr insala sclipo loopt hojoki qeyno. Airbnb palantir skype, etsy. ' +
  // 'Joost cotweet knewton bubbli, unigo twones. Akismet skype scribd vimeo, skype omgpop kno imvu, shopify dropio. Jajah heroku xobni glogster twones jabber rovio, jaiku blippy wikia jumo oooooc. Jumo lijit tumblr jibjab zooomr sifteo hojoki mog reddit, jabber twitter zinch doostang wakoopa ebay. Yoono klout weebly geni blippy, twitter kno yoono edmodo, joyent joukuu mzinga. ' +
  'zappos. Ning babblely trulia zooomr vimeo, zimbra plaxo. Zooomr blyve stypi joukuu imvu chumby voxy, ideeli omgpop elgg geni qeyno joyent, loopt reddit eskobo flickr odeo. Heekya plickers wesabe lijit kno, hojoki convore.';

const getRandomNumber = getRandomNumberGenerator();

const palettes = {
  turquoise: (d: RawDatum, i: number) => ['#5bc0be', '#6fffe9'][i % 2],
  vivid: (d: RawDatum, i: number) => ['#2ec4b6', '#e71d36', '#ff9f1c'][i % 3],
  warm: (d: RawDatum, i: number) => ['#edc951', '#eb6841', '#cc2a36', '#4f372d', '#00a0b0'][i % 5],
  greenBlues: () => `rgb(${getRandomNumber(0, 10)}, ${getRandomNumber(50, 100)}, ${getRandomNumber(50, 100)})`,
  redBlue: () => `rgb(${getRandomNumber(100, 255)},${0},${getRandomNumber(100, 255)})`,
  greyScale: () => {
    const level = getRandomNumber(0, 200);
    return `rgb(${level},${level},${level})`;
  },
  weight: (d: RawDatum) => {
    const level = (1 - d.weight ** 15) * 200;
    return `rgb(${level},${level},${level})`;
  },
  colorByWordLength: (d: RawDatum) => {
    const level = d.text.length;
    return `rgb(${level < 5 ? level * 60 : level < 7 ? level * 40 : level * 25},${
      level < 5 ? level * 5 : level < 7 ? level * 10 : level * 5
    },${level < 5 ? level * 25 : level < 7 ? level * 40 : level * 15})`;
  },
  euiLight: (d: RawDatum, i: number) => {
    return euiPalettes.echPaletteForLightBackground.colors[i % euiPalettes.echPaletteForLightBackground.colors.length];
  },
  euiColorBlind: (d: RawDatum, i: number) => {
    return euiPalettes.echPaletteColorBlind.colors[i % euiPalettes.echPaletteColorBlind.colors.length];
  },
};

type WordcloudKnobs = Omit<WordcloudSpec, 'specType' | 'chartType' | 'data' | 'outOfRoomCallback' | 'id'> & {
  palette: keyof typeof palettes;
  backgroundColor: Color;
};

// Used in e2e testing
export const TEMPLATES = ['edit', 'single', 'rightAngled', 'multiple', 'squareWords', 'smallWaves', 'sparse'];
const getTemplate = (name: string): WordcloudKnobs => {
  switch (name) {
    case 'single':
      return {
        spiral: 'rectangular',
        startAngle: 0,
        endAngle: 0,
        angleCount: 1,
        padding: 1,
        exponent: 4,
        fontWeight: 900,
        minFontSize: 14,
        maxFontSize: 92,
        fontFamily: 'Arial',
        fontStyle: 'normal',
        palette: 'greyScale',
        weightFn: WeightFn.exponential,
        backgroundColor: '#9fa714',
      };
    case 'rightAngled':
      return {
        spiral: 'rectangular',
        startAngle: 0,
        endAngle: 90,
        angleCount: 2,
        padding: 1,
        exponent: 4,
        fontWeight: 600,
        minFontSize: 14,
        maxFontSize: 92,
        fontFamily: 'Arial Narrow',
        fontStyle: 'normal',
        palette: 'euiLight',
        weightFn: WeightFn.exponential,
        backgroundColor: '#ffffff',
      };
    case 'multiple':
      return {
        spiral: 'archimedean',
        startAngle: -90,
        endAngle: 90,
        angleCount: 16,
        padding: 1,
        exponent: 15,
        fontWeight: 100,
        minFontSize: 16,
        maxFontSize: 50,
        fontFamily: 'Luminari',
        fontStyle: 'italic',
        palette: 'redBlue',
        weightFn: WeightFn.exponential,
        backgroundColor: '#1c1c24',
      };
    case 'squareWords':
      return {
        spiral: 'archimedean',
        startAngle: -45,
        endAngle: 45,
        angleCount: 2,
        padding: 0,
        exponent: 3,
        fontWeight: 100,
        minFontSize: 10,
        maxFontSize: 90,
        fontFamily: 'Arial Narrow',
        fontStyle: 'normal',
        palette: 'weight',
        weightFn: WeightFn.exponential,
        backgroundColor: '#4a6960',
      };
    case 'smallWaves':
      return {
        spiral: 'rectangular',
        startAngle: -15,
        endAngle: 15,
        angleCount: 7,
        padding: 0.5,
        exponent: 5,
        fontWeight: 600,
        minFontSize: 17,
        maxFontSize: 79,
        fontFamily: 'Impact',
        fontStyle: 'normal',
        palette: 'euiColorBlind',
        weightFn: WeightFn.exponential,
        backgroundColor: '#ffffff',
      };
    case 'sparse':
      return {
        spiral: 'rectangular',
        startAngle: 0,
        endAngle: 0,
        angleCount: 1,
        padding: getRandomNumber(2, 22),
        exponent: 15,
        fontWeight: 600,
        minFontSize: 12,
        maxFontSize: 60,
        fontFamily: 'Courier',
        fontStyle: 'normal',
        palette: 'vivid',
        weightFn: WeightFn.exponential,
        backgroundColor: '#1c1c24',
      };
    case 'edit':
    default:
      return {
        spiral: select('shape', { oval: 'archimedean', rectangular: 'rectangular' }, 'archimedean'),
        startAngle: number('startAngle', -90, { range: true, min: -360, max: 360, step: 1 }),
        endAngle: number('endAngle', 90, { range: true, min: -360, max: 360, step: 1 }),
        angleCount: number('angleCount', 16, { range: true, min: 2, max: 360, step: 1 }),
        padding: number('padding', 0.5, { range: true, min: 0, max: 10, step: 0.5 }),
        exponent: number('exponent', 15, { range: true, min: 0, max: 15, step: 1 }),
        fontWeight: number('fontWeight', 900, { range: true, min: 100, max: 900, step: 100 }),
        minFontSize: number('minFontSize', 15, { range: true, min: 6, max: 85, step: 1 }),
        maxFontSize: number('maxFontSize', 80, { range: true, min: 15, max: 150, step: 1 }),
        fontFamily: select(
          'fontFamily',
          {
            Arial: 'Arial',
            'Arial Narrow': 'Arial Narrow',
            Courier: 'Courier',
            Impact: 'Impact',
            Luminari: 'Luminari',
          },
          'Arial',
        ),
        fontStyle: select<FontStyle>('fontStyle', { normal: 'normal', italic: 'italic' }, 'italic'),
        palette: select(
          'palette',
          Object.keys(palettes).reduce((p, k) => ({ ...p, [k]: k }), {}),
          'turquoise',
        ),
        weightFn: select(
          'weightFn',
          {
            linear: WeightFn.linear,
            exponential: WeightFn.exponential,
            squareRoot: WeightFn.squareRoot,
            log: WeightFn.log,
          },
          WeightFn.exponential,
        ),
        backgroundColor: color('background', '#1c1c24'),
      };
  }
};

const rawData = text
  .replace(/[,.]/g, '')
  .toLowerCase()
  .split(' ')
  .filter((d, index, a) => a.indexOf(d) === index)
  .map(function wordMapper(d) {
    return {
      text: d,
      weight: getRandomNumber(0, 1, 20),
    };
  });

interface RawDatum {
  text: string;
  weight: number;
}

function sampleData(paletteName: keyof typeof palettes): WordModel[] {
  return rawData.map(function rawMapper(d, i) {
    return {
      ...d,
      color: palettes[paletteName](d, i),
    };
  });
}

export const Example = () => {
  const configName = select(
    'template',
    TEMPLATES.reduce((p, k) => ({ ...p, [k]: k }), {}),
    'edit',
  );
  const { backgroundColor, palette, ...knobs } = getTemplate(configName);

  return (
    <Chart>
      <Settings
        theme={{ background: { color: backgroundColor } }}
        baseTheme={useBaseTheme()}
        onElementClick={(d) => {
          const datum = (d as WordCloudElementEvent[])[0][0];
          action('onElementClick')(`${datum.text}: ${datum.weight}`);
        }}
        onElementOver={(d) => {
          const datum = (d as WordCloudElementEvent[])[0][0];
          action('onElementOver')(`${datum.text}: ${datum.weight}`);
        }}
      />
      <Wordcloud
        id="spec_1"
        {...knobs}
        data={sampleData(palette)}
        outOfRoomCallback={(wordCount: number, renderedWordCount: number, renderedWords: string[]) => {
          action('outOfRoomCallback')(
            `Managed to render ${renderedWordCount} words out of ${wordCount} words: ${renderedWords.join(', ')}`,
          );
        }}
      />
    </Chart>
  );
};
