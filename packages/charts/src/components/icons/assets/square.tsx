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
export function SquareIcon(extraProps: IconComponentProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" {...extraProps}>
      <rect width="12" height="12" x="2" y="2" rx="2" fillRule="evenodd" />
    </svg>
  );
}
