/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
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
