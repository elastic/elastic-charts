import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import { withOptions } from '@storybook/addon-options';
import { addDecorator, configure } from '@storybook/react';
import '../src/index.scss';
import './style.scss';
import { switchTheme } from './theme_service';

switchTheme('light');

addDecorator(
  withOptions({
    name: 'Elastic Charts',
    url: 'https://github.com/elastic/elastic-charts',
    addonPanelInRight: true,
    sidebarAnimations: true,
  }),
);
addDecorator(withKnobs);
addDecorator(
  withInfo({
    inline: true,
    source: false,
    styles: {
      infoBody: {
        marginTop: 0,
        marginBottom: 0,
      },
    },
  }),
);

function loadStories() {
  require('../stories/bar_chart.tsx');
  require('../stories/line_chart.tsx');
  require('../stories/area_chart.tsx');
  require('../stories/axis.tsx');
  require('../stories/mixed.tsx');
  require('../stories/legend.tsx');
  require('../stories/interactions.tsx');
  require('../stories/rotations.tsx');
  require('../stories/styling.tsx');
  require('../stories/grid.tsx');
}

configure(loadStories, module);
