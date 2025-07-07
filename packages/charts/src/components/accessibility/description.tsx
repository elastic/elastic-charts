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
  const { customDescription, generatedDescription, descriptionId } = props;
  
  // Return null if neither description exists
  if (!customDescription && !generatedDescription) return null;
  
  return (
    <>
      {generatedDescription && <span>{generatedDescription}</span>}
      {customDescription && <p id={descriptionId}>{customDescription}</p>}
    </>
  );
}
