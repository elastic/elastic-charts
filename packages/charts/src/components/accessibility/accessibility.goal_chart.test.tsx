/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mount } from 'enzyme';
import React from 'react';

import { Goal } from '../../chart_types/goal_chart/specs';
import { GoalSubtype } from '../../chart_types/goal_chart/specs/constants';
import { Chart } from '../chart';

describe('Goal Chart Accessibility', () => {
  const goalChartWrapper = mount(
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

  const bandLabelsAscending = ['freezing', 'chilly', 'brisk'];
  const bandsAscending = [200, 250, 300];

  const ascendingBandLabelsGoalChart = mount(
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

  it('should test defaults for goal charts', () => {
    const screenReaderText = goalChartWrapper.find('.echScreenReaderOnly').first().text();
    // Check for the main components that should be present in the new structure
    expect(screenReaderText).toContain('Revenue 2020 YTD  (thousand USD)');
    expect(screenReaderText).toContain('goal chart');
    expect(screenReaderText).toContain('Minimum: 0');
    expect(screenReaderText).toContain('Maximum: 300');
    expect(screenReaderText).toContain('Target: 260');
    expect(screenReaderText).toContain('Value: 170');
  });

  it('should correctly render ascending semantic values', () => {
    expect(ascendingBandLabelsGoalChart.find('.echGoalDescription').first().text()).toBe(
      '0 - 200freezing200 - 250chilly250 - 300brisk',
    );
  });
});
