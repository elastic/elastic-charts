/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';

import { deepEqual } from '../../../utils/fast_deep_equal';
import type { IconComponentProps } from '../icon';

/** @internal */
export class DotIcon extends React.Component<IconComponentProps> {
  shouldComponentUpdate(nextProps: IconComponentProps) {
    return !deepEqual(this.props, nextProps);
  }

  render() {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...this.props}>
        <circle cx={8} cy={8} r={4} />
      </svg>
    );
  }
}
