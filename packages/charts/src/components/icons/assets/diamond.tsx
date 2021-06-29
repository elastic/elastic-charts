/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { IconComponentProps } from '../icon';

/** @internal */
export function DiamondIcon(extraProps: IconComponentProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" {...extraProps}>
      <path
        d="M5.64196714,9.1954304 L11.722162,11.222162 L9.6954304,5.14196714 L4.12191842,3.62191842 L5.64196714,9.1954304 Z M2.69669914,2.19669914 L10.4748737,4.31801948 L13.3033009,12.8033009 L4.81801948,9.97487373 L2.69669914,2.19669914 Z"
        transform="rotate(45 8 7.5)"
      />
    </svg>
  );
}
