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

import { BandViewModel } from '../../chart_types/goal_chart/layout/types/viewmodel_types';
import { A11ySettings } from '../../state/selectors/get_accessibility_config';

interface GoalSemanticDescriptionProps {
  bandLabels: BandViewModel[];
  firstValue: number;
}

/** @internal */
export const GoalSemanticDescription = ({
  bandLabels,
  labelId,
  firstValue,
}: A11ySettings & GoalSemanticDescriptionProps) => {
  return bandLabels.length > 1 ? (
    <dl className="echScreenReaderOnly echGoalDescription" key={`goalChart--${labelId}`}>
      {bandLabels.map(({ value, text }, index) => {
        const prevValue = bandLabels[index - 1];
        return prevValue !== undefined ? (
          <>
            <dt key={`dt--${index}`}>{`${prevValue.value} - ${value}`}</dt>
            <dd key={`dd--${index}`}>{`${text[index]}`}</dd>
          </>
        ) : (
          <>
            <dt key={`dt--${index}`}>{`${firstValue} - ${value}`}</dt>
            <dd key={`dd--${index}`}>{`${text[index]}`}</dd>
          </>
        );
      })}
    </dl>
  ) : null;
};
