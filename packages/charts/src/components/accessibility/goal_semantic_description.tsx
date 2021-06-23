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

interface GoalSemanticDescriptionProps {
  semanticValues: Array<(string | number)[]>;
}

/** @internal */
export const GoalSemanticDescription = ({ semanticValues }: GoalSemanticDescriptionProps) => {
  return (
    <div className="echScreenReaderOnly">
      {semanticValues.map(([value, semantic], index) => {
        const nextValue = semanticValues[index + 1];
        const prevValue = semanticValues[index - 1];
        return nextValue !== undefined ? (
          nextValue[0] > value ? (
            <dd key={index}>{`values ${value} - ${nextValue[0]}: ${semantic}`}</dd>
          ) : (
            <dd key={index}>{`values ${nextValue[0]} - ${value}: ${semantic}`}</dd>
          )
        ) : prevValue[0] < value ? (
          <dd key={index}>{`values above ${value}: ${semantic}`}</dd>
        ) : (
          <dd key={index}>{`values below ${value}: ${semantic}`}</dd>
        );
      })}
    </div>
  );
};
