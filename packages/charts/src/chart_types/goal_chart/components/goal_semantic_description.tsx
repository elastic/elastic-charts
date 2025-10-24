/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { Fragment } from 'react';

import type { A11ySettings } from '../../../state/selectors/get_accessibility_config';
import type { BandViewModel } from '../layout/types/viewmodel_types';

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
  return bandLabels[0] && bandLabels[0].text.length > 1 ? (
    <dl
      className="echScreenReaderOnly echGoalDescription"
      key={`goalChart--${labelId}`}
      data-testid="echGoalScreenReaderDescription"
    >
      {bandLabels.map(({ value, text }, index) => {
        if (firstValue === value) return;
        const prevValue = bandLabels[index - 1];
        return (
          <Fragment key={`dtdd--${value}--${text[index]}`}>
            <dt>{`${prevValue?.value ?? firstValue} - ${value}`}</dt>
            <dd>{`${text[index]}`}</dd>
          </Fragment>
        );
      })}
    </dl>
  ) : null;
};
