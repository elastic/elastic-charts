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
export function XIcon(extraProps: IconComponentProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" {...extraProps}>
      <path d="M7.29289322,8 L3.14644661,3.85355339 C2.95118446,3.65829124 2.95118446,3.34170876 3.14644661,3.14644661 C3.34170876,2.95118446 3.65829124,2.95118446 3.85355339,3.14644661 L8,7.29289322 L12.1464466,3.14644661 C12.3417088,2.95118446 12.6582912,2.95118446 12.8535534,3.14644661 C13.0488155,3.34170876 13.0488155,3.65829124 12.8535534,3.85355339 L8.70710678,8 L12.8535534,12.1464466 C13.0488155,12.3417088 13.0488155,12.6582912 12.8535534,12.8535534 C12.6582912,13.0488155 12.3417088,13.0488155 12.1464466,12.8535534 L8,8.70710678 L3.85355339,12.8535534 C3.65829124,13.0488155 3.34170876,13.0488155 3.14644661,12.8535534 C2.95118446,12.6582912 2.95118446,12.3417088 3.14644661,12.1464466 L7.29289322,8 Z" />
    </svg>
  );
}
