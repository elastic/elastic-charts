/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createGoalChartDescription } from './goal_chart_summary_utils';
import type { GoalChartData } from '../../chart_types/goal_chart/state/selectors/get_goal_chart_data';

describe('createGoalChartDescription', () => {
  const mockGoalChartData: GoalChartData = {
    minimum: 0,
    maximum: 300,
    target: 260,
    value: 170,
  };

  it('should return null for non-goal chart types', () => {
    const result = createGoalChartDescription('bar chart', mockGoalChartData);
    expect(result).toBeNull();
  });

  it('should return null when goalChartData is undefined', () => {
    const result = createGoalChartDescription('goal chart', undefined);
    expect(result).toBeNull();
  });

  it('should return null when maximum is NaN', () => {
    const invalidData = {
      ...mockGoalChartData,
      maximum: NaN,
    };
    const result = createGoalChartDescription('goal chart', invalidData);
    expect(result).toBeNull();
  });

  it('should create description for goal chart', () => {
    const result = createGoalChartDescription('goal chart', mockGoalChartData);
    expect(result).toBe('Minimum: 0, Maximum: 300, Target: 260, Value: 170');
  });

  it('should create description for horizontalBullet chart', () => {
    const result = createGoalChartDescription('horizontalBullet chart', mockGoalChartData);
    expect(result).toBe('Minimum: 0, Maximum: 300, Target: 260, Value: 170');
  });

  it('should create description for verticalBullet chart', () => {
    const result = createGoalChartDescription('verticalBullet chart', mockGoalChartData);
    expect(result).toBe('Minimum: 0, Maximum: 300, Target: 260, Value: 170');
  });

  it('should handle decimal values', () => {
    const decimalData: GoalChartData = {
      minimum: 0.5,
      maximum: 100.75,
      target: 85.25,
      value: 67.8,
    };
    const result = createGoalChartDescription('goal chart', decimalData);
    expect(result).toBe('Minimum: 0.5, Maximum: 100.75, Target: 85.25, Value: 67.8');
  });

  it('should handle negative values', () => {
    const negativeData: GoalChartData = {
      minimum: -50,
      maximum: 50,
      target: 10,
      value: -5,
    };
    const result = createGoalChartDescription('goal chart', negativeData);
    expect(result).toBe('Minimum: -50, Maximum: 50, Target: 10, Value: -5');
  });

  it('should handle zero values', () => {
    const zeroData: GoalChartData = {
      minimum: 0,
      maximum: 0,
      target: 0,
      value: 0,
    };
    const result = createGoalChartDescription('goal chart', zeroData);
    expect(result).toBe('Minimum: 0, Maximum: 0, Target: 0, Value: 0');
  });

  it('should handle large numbers', () => {
    const largeData: GoalChartData = {
      minimum: 1000000,
      maximum: 5000000,
      target: 4000000,
      value: 3500000,
    };
    const result = createGoalChartDescription('goal chart', largeData);
    expect(result).toBe('Minimum: 1000000, Maximum: 5000000, Target: 4000000, Value: 3500000');
  });
});
