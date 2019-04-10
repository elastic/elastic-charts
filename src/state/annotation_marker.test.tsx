import * as React from 'react';

import {
  AnnotationDomainType,
  AnnotationDomainTypes,
  AnnotationSpec,
  AnnotationTypes,
  Position,
  Rotation,
} from '../lib/series/specs';
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../lib/themes/theme';
import { Dimensions } from '../lib/utils/dimensions';
import { getAnnotationId, getGroupId, GroupId } from '../lib/utils/ids';
import { createContinuousScale, Scale, ScaleType } from '../lib/utils/scales/scales';
import {
  AnnotationLinePosition,
  computeLineAnnotationDimensions,
  DEFAULT_LINE_OVERFLOW,
  isWithinLineBounds,
} from './annotation_utils';
import { Point } from './chart_state';

describe('annotation marker', () => {
  const groupId = getGroupId('foo-group');

  const minRange = 0;
  const maxRange = 100;

  const continuousData = [0, 10];
  const continuousScale = createContinuousScale(
    ScaleType.Linear,
    continuousData,
    minRange,
    maxRange,
  );

  const chartDimensions: Dimensions = {
    width: 10,
    height: 20,
    top: 5,
    left: 15,
  };

  const yScales: Map<GroupId, Scale> = new Map();
  yScales.set(groupId, continuousScale);

  const xScale: Scale = continuousScale;

  test('should compute line annotation dimensions with marker if defined (y domain)', () => {
    const chartRotation: Rotation = 0;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
      marker: <div />,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [
      {
        position: [DEFAULT_LINE_OVERFLOW, 20, 10, 20],
        details: { detailsText: 'foo', headerText: '2' },
        tooltipLinePosition: [0, 20, 10, 20],
        marker: {
          icon: <div />,
          transform: 'translate(calc(0px - 0%),calc(20px - 50%))',
          color: '#000',
          dimensions: { width: 0, height: 0 },
        },
      },
    ];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions with marker if defined (x domain)', () => {
    const chartRotation: Rotation = 0;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
      marker: <div />,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [
      {
        position: [20, -DEFAULT_LINE_OVERFLOW, 20, 20],
        details: { detailsText: 'foo', headerText: '2' },
        tooltipLinePosition: [20, 0, 20, 20],
        marker: {
          icon: <div />,
          transform: 'translate(calc(20px - 0%),calc(20px - 50%))',
          color: '#000',
          dimensions: { width: 0, height: 0 },
        },
      },
    ];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute if a point is within an annotation line bounds (xDomain annotation)', () => {
    const linePosition1: AnnotationLinePosition = [10, 0, 10, 20];
    const cursorPosition1: Point = { x: 0, y: 0 };
    const cursorPosition2: Point = { x: 10, y: 0 };

    const offset: number = 0;
    const horizontalChartRotation: Rotation = 0;
    const verticalChartRotation: Rotation = 90;
    const domainType: AnnotationDomainType = AnnotationDomainTypes.XDomain;

    const marker = {
      icon: <div />,
      transform: '',
      color: 'custom-color',
      dimensions: { width: 10, height: 10 },
    };

    const bottomHorizontalRotationOutsideBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition1,
      offset,
      horizontalChartRotation,
      domainType,
      marker,
    );

    expect(bottomHorizontalRotationOutsideBounds).toBe(false);

    const bottomHorizontalRotationWithinBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition2,
      offset,
      horizontalChartRotation,
      domainType,
      marker,
    );

    expect(bottomHorizontalRotationWithinBounds).toBe(true);

    const topHorizontalRotationOutsideBounds = isWithinLineBounds(
      Position.Top,
      linePosition1,
      cursorPosition1,
      offset,
      horizontalChartRotation,
      domainType,
      marker,
    );

    expect(topHorizontalRotationOutsideBounds).toBe(false);

    const verticalRotationOutsideBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition1,
      offset,
      verticalChartRotation,
      domainType,
      marker,
    );

    expect(verticalRotationOutsideBounds).toBe(true);
  });

  test('should compute if a point is within an annotation line bounds (yDomain annotation)', () => {
    const linePosition1: AnnotationLinePosition = [10, 0, 10, 20];
    const cursorPosition1: Point = { x: 0, y: 0 };
    const cursorPosition2: Point = { x: 10, y: 0 };

    const offset: number = 0;
    const horizontalChartRotation: Rotation = 0;
    const verticalChartRotation: Rotation = 90;
    const domainType: AnnotationDomainType = AnnotationDomainTypes.YDomain;

    const marker = {
      icon: <div />,
      transform: '',
      color: 'custom-color',
      dimensions: { width: 10, height: 10 },
    };

    const rightHorizontalRotationWithinBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition1,
      offset,
      horizontalChartRotation,
      domainType,
      marker,
    );

    expect(rightHorizontalRotationWithinBounds).toBe(true);

    const leftHorizontalRotationWithinBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition2,
      offset,
      horizontalChartRotation,
      domainType,
      marker,
    );

    expect(leftHorizontalRotationWithinBounds).toBe(true);

    const rightHorizontalRotationOutsideBounds = isWithinLineBounds(
      Position.Right,
      linePosition1,
      cursorPosition1,
      offset,
      horizontalChartRotation,
      domainType,
      marker,
    );

    expect(rightHorizontalRotationOutsideBounds).toBe(false);

    const verticalRotationOutsideBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition1,
      offset,
      verticalChartRotation,
      domainType,
      marker,
    );

    expect(verticalRotationOutsideBounds).toBe(false);
  });
});
