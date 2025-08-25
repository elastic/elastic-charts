/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// @ts-nocheck - EUI icon assets have no types
// see https://github.com/elastic/eui/issues/5463

import { icon as visualizeAppIcon } from '@elastic/eui/es/components/icon/assets/app_visualize';
import { icon as arrowDownIcon } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as arrowLeftIcon } from '@elastic/eui/es/components/icon/assets/arrow_left';
import { icon as arrowRightIcon } from '@elastic/eui/es/components/icon/assets/arrow_right';
import { icon as arrowUpIcon } from '@elastic/eui/es/components/icon/assets/arrow_up';
import { icon as checkIcon } from '@elastic/eui/es/components/icon/assets/check';
import { icon as filterIcon } from '@elastic/eui/es/components/icon/assets/filter';
import { icon as iInCircleIcon } from '@elastic/eui/es/components/icon/assets/iInCircle';
import { icon as pencilIcon } from '@elastic/eui/es/components/icon/assets/pencil';
import { icon as starFilledIcon } from '@elastic/eui/es/components/icon/assets/star_filled';
import { icon as tokenKeyIcon } from '@elastic/eui/es/components/icon/assets/tokenKey';
import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';

appendIconComponentCache({
  arrowUp: arrowUpIcon,
  arrowLeft: arrowLeftIcon,
  arrowDown: arrowDownIcon,
  arrowRight: arrowRightIcon,
  iInCircle: iInCircleIcon,
  tokenKey: tokenKeyIcon,
  filter: filterIcon,
  starFilled: starFilledIcon,
  pencil: pencilIcon,
  visualizeApp: visualizeAppIcon,
  check: checkIcon,
});
