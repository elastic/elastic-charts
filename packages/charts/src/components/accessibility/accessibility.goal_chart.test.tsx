/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { Goal } from '../../chart_types/goal_chart/specs';
import { GoalSubtype } from '../../chart_types/goal_chart/specs/constants';
import { Chart } from '../chart';

describe('Goal chart type accessibility', () => {
  const bandLabelsAscending = ['freezing', 'chilly', 'brisk'];
  const bandsAscending = [200, 250, 300];

  it('should test defaults for goal charts', () => {
    render(
      <Chart>
        <Goal
          id="spec_1"
          subtype={GoalSubtype.Goal}
          base={0}
          target={260}
          actual={170}
          bands={[200, 250, 300]}
          domain={{ min: 0, max: 300 }}
          ticks={[0, 50, 100, 150, 200, 250, 300]}
          labelMajor="Revenue 2020 YTD  "
          labelMinor="(thousand USD)  "
          centralMajor="170"
          centralMinor=""
          angleStart={Math.PI}
          angleEnd={0}
        />
      </Chart>,
    );
    expect(screen.getByTestId('echScreenReaderSummary').textContent).toBe(
      'Goal chart.Major label:Revenue 2020 YTD  Minor label:(thousand USD)  Minimum:0Maximum:300Target:260Value:170',
    );
  });
  it('should correctly render ascending semantic values', () => {
    render(
      <Chart className="story-chart">
        <Goal
          id="spec_1"
          subtype={GoalSubtype.Goal}
          base={0}
          target={260}
          actual={170}
          bands={bandsAscending}
          domain={{ min: 0, max: 300 }}
          ticks={[0, 50, 100, 150, 200, 250, 300]}
          labelMajor="Revenue 2020 YTD  "
          labelMinor="(thousand USD)  "
          centralMajor="170"
          centralMinor=""
          angleStart={Math.PI}
          angleEnd={0}
          bandLabels={bandLabelsAscending}
        />
      </Chart>,
    );

    expect(screen.getByTestId('echGoalScreenReaderDescription').textContent).toBe(
      '0 - 200freezing200 - 250chilly250 - 300brisk',
    );
  });
});
