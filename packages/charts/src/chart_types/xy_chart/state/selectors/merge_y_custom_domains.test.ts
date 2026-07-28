/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mergeYCustomDomainsByGroupId } from './merge_y_custom_domains';
import { MockGlobalSpec } from '../../../../mocks/specs/specs';
import { mergePartial, Position } from '../../../../utils/common';
import type { GroupId } from '../../../../utils/ids';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { AxisStyle } from '../../../../utils/themes/theme';
import type { AxisSpec, DomainRange } from '../../utils/specs';

const getCustomStyle = (rotation = 0, padding = 10): AxisStyle =>
  mergePartial(LIGHT_THEME.axes, {
    tickLine: {
      size: 10,
      padding,
    },
    tickLabel: {
      fontSize: 16,
      fontFamily: 'Arial',
      rotation,
    },
  });
const style = getCustomStyle();

const verticalAxisSpec = MockGlobalSpec.yAxis({
  id: 'axis_1',
  title: 'Axis 1',
  groupId: 'group_1',
  hide: false,
  style,
  integersOnly: false,
});

const horizontalAxisSpec = MockGlobalSpec.xAxis({
  id: 'axis_2',
  title: 'Axis 2',
  groupId: 'group_1',
  hide: false,
  position: Position.Top,
  style,
  integersOnly: false,
});

describe('mergeYCustomDomainsByGroupId', () => {
  test('should merge axis domains by group id', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: 2,
      max: 9,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs = [verticalAxisSpec];

    // Base case
    const expectedSimpleMap = new Map<GroupId, DomainRange>();
    expectedSimpleMap.set(groupId, { min: 2, max: 9 });

    const simpleDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(simpleDomainsByGroupId).toEqual(expectedSimpleMap);

    // Multiple definitions for the same group
    const domainRange2 = {
      min: 0,
      max: 7,
    };

    const altVerticalAxisSpec = { ...verticalAxisSpec, id: 'axis2' };

    altVerticalAxisSpec.domain = domainRange2;
    axesSpecs.push(altVerticalAxisSpec);

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: 0, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);

    // xDomain limit (bad config)
    horizontalAxisSpec.domain = {
      min: 5,
      max: 15,
    };
    axesSpecs.push(horizontalAxisSpec);

    const attemptToMerge = () => {
      mergeYCustomDomainsByGroupId(axesSpecs, 0);
    };

    expect(attemptToMerge).toThrow('[Axis axis_2]: custom domain for xDomain should be defined in Settings');
  });

  test('should merge axis domains by group id: partial upper bounded prevDomain with complete domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: NaN,
      max: 9,
    };

    const domainRange2 = {
      min: 0,
      max: 7,
    };

    verticalAxisSpec.domain = domainRange1;

    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    axis2.domain = domainRange2;
    const axesSpecs = [verticalAxisSpec, axis2];

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: 0, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should merge axis domains by group id: partial lower bounded prevDomain with complete domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: -1,
      max: NaN,
    };

    const domainRange2 = {
      min: 0,
      max: 7,
    };

    verticalAxisSpec.domain = domainRange1;
    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    const axesSpecs = [verticalAxisSpec, axis2];

    axis2.domain = domainRange2;

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: -1, max: 7 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should merge axis domains by group id: partial upper bounded prevDomain with lower bounded domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: NaN,
      max: 9,
    };

    const domainRange2 = {
      min: 0,
      max: NaN,
    };

    const domainRange3 = {
      min: -1,
      max: NaN,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs: AxisSpec[] = [];
    axesSpecs.push(verticalAxisSpec);

    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    axis2.domain = domainRange2;
    axesSpecs.push(axis2);

    const axis3 = { ...verticalAxisSpec, id: 'axis3' };

    axis3.domain = domainRange3;
    axesSpecs.push(axis3);

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: -1, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should merge axis domains by group id: partial lower bounded prevDomain with upper bounded domain', () => {
    const groupId = 'group_1';
    const domainRange1 = {
      min: 2,
      max: NaN,
    };

    const domainRange2 = {
      min: NaN,
      max: 7,
    };

    const domainRange3 = {
      min: NaN,
      max: 9,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs: AxisSpec[] = [];
    axesSpecs.push(verticalAxisSpec);

    const axis2 = { ...verticalAxisSpec, id: 'axis2' };

    axis2.domain = domainRange2;
    axesSpecs.push(axis2);

    const axis3 = { ...verticalAxisSpec, id: 'axis3' };

    axis3.domain = domainRange3;
    axesSpecs.push(axis3);

    const expectedMergedMap = new Map<GroupId, DomainRange>();
    expectedMergedMap.set(groupId, { min: 2, max: 9 });

    const mergedDomainsByGroupId = mergeYCustomDomainsByGroupId(axesSpecs, 0);
    expect(mergedDomainsByGroupId).toEqual(expectedMergedMap);
  });

  test('should throw on invalid domain', () => {
    const domainRange1 = {
      min: 9,
      max: 2,
    };

    verticalAxisSpec.domain = domainRange1;

    const axesSpecs = [verticalAxisSpec];

    const attemptToMerge = () => {
      mergeYCustomDomainsByGroupId(axesSpecs, 0);
    };
    const expectedError = '[Axis axis_1]: custom domain is invalid, min is greater than max';

    expect(attemptToMerge).toThrow(expectedError);
  });
});
