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

import { useState } from "react";

interface WithParameters {
  (): JSX.Element;
  parameters?: {
    backgrounds?: {
      default?: string;
      [key: string]: any;
    };
    themes?: {
      default: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

function setTheme(name: string) {
  if (name === 'Light') {
    document.querySelector('html')?.classList.add('light-theme');
    document.querySelector('html')?.classList.remove('dark-theme');
  } else {
    document.querySelector('html')?.classList.add('dark-theme');
    document.querySelector('html')?.classList.remove('light-theme');
  }
}

export function useGlobalsParameters() {
  const [themeName, setThemeName] = useState<string>('Light');
  const [backgroundColor, setBackgroundColor] = useState<string|undefined>('White');

  /**
   * Handles setting global context values. Stub for theme and background addons
   */
  function setParams<T extends WithParameters>({ parameters }: T) {
    const newThemeName = parameters?.themes?.default ?? 'Light';
    setBackgroundColor(parameters?.backgrounds?.value ?? 'White');
    setThemeName(newThemeName);
    setTheme(newThemeName);
  }

  return {
    themeName,
    backgroundColor,
    setParams,
  }
}
