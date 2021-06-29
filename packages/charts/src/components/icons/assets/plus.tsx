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
export function PlusIcon(extraProps: IconComponentProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" {...extraProps}>
      <path d="M8.25,3 C8.52614237,3 8.75,3.22385763 8.75,3.5 L8.75,7.25 L12.5,7.25 C12.7761424,7.25 13,7.47385763 13,7.75 L13,8.25 C13,8.52614237 12.7761424,8.75 12.5,8.75 L8.75,8.75 L8.75,12.5 C8.75,12.7761424 8.52614237,13 8.25,13 L7.75,13 C7.47385763,13 7.25,12.7761424 7.25,12.5 L7.25,8.75 L3.5,8.75 C3.22385763,8.75 3,8.52614237 3,8.25 L3,7.75 C3,7.47385763 3.22385763,7.25 3.5,7.25 L7.25,7.25 L7.25,3.5 C7.25,3.22385763 7.47385763,3 7.75,3 L8.25,3 Z" />
    </svg>
  );
}
