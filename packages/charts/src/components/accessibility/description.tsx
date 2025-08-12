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
  if (!props.description) return null;

  // Fallback to retain the simple legacy format of "Chart type: [description]"
  if (props.description.startsWith('Chart type:')) {
    // If the description starts with "Chart type:", retain the legacy format using dl.
    // We parse the string and strip "Chart type:" again from the actual description.
    // It's a bit brittle, but we can remove this once we migrated all charts to use the new format.
    const description = props.description.replace(/^Chart type:/, '').trim();
    return (
      <dl id={props.descriptionId}>
        <dt>Chart type:</dt>
        <dd>{description}</dd>
      </dl>
    );
  }

  return <p id={props.descriptionId}>{props.description}</p>;
}
