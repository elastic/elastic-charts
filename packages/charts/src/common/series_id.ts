/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CategoryKey } from './category';
import { SpecId } from '../utils/ids';

/**
 * A string key used to uniquely identify a series
 * @public
 */
export type SeriesKey = CategoryKey;

/**
 * A series identifier
 * @public
 */
export type SeriesIdentifier = {
  /**
   * The SpecId, used to identify the spec
   */
  specId: SpecId;
  /**
   * A string key used to uniquely identify a series
   */
  key: SeriesKey;
};
