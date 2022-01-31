/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TEMPLATES } from '../../storybook/stories/wordcloud/1_wordcloud.story';
import { common } from '../page_objects';

describe('Scales stories', () => {
  it.each(TEMPLATES.filter((t) => t !== 'edit'))('should render %s wordcloud template', async (template) => {
    await common.expectChartAtUrlToMatchScreenshot(
      `http://localhost:9001/?path=/story/wordcloud-alpha--simple-wordcloud&knob-template=${template}`,
    );
  });
});
