/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  getArrayKnob,
  getNumberSelectKnob,
  getPositiveNumberKnob,
  getToggledNumberKnob,
  getMultiSelectKnob,
} from './custom';
import { enumKnobs } from './enums';
import { specialEnumKnobs } from './special_enums';
import { getKnobFromEnum } from './utils';

export const customKnobs = {
  enum: {
    ...enumKnobs,
    ...specialEnumKnobs,
  },
  fromEnum: getKnobFromEnum,
  array: getArrayKnob,
  positiveNumber: getPositiveNumberKnob,
  toggledNumber: getToggledNumberKnob,
  numberSelect: getNumberSelectKnob,
  multiSelect: getMultiSelectKnob,
};
