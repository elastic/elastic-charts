/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * A string key is used to uniquely identify categories
 *
 * todo: broaden it; some options:
 *   - allow other values of `PrimitiveValue` type (now: string | number | null) but should add Symbol
 *   - allow a descriptor object, eg. `{ key: PrimitiveValue, label: string }`
 *   - allow an accessor that operates on the key, and maps it to a label
 */

/** @public */
export type CategoryKey = string;

/** @public */
export type CategoryLabel = string;
