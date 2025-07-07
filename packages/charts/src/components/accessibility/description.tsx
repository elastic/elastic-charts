/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import type { A11ySettings } from '../../state/selectors/get_accessibility_config';

/** @internal */
export function ScreenReaderDescription(props: A11ySettings) {
  const { description, descriptionId } = props;

  if (!description) return null;

  return <p id={descriptionId}>{description}</p>;
}
