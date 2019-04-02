import * as React from 'react';

import { AnnotationDomainType, AnnotationSpec, AnnotationType, Position, Rotation } from '../lib/series/specs';
import { Dimensions } from '../lib/utils/dimensions';
import { getAnnotationId, getGroupId, GroupId } from '../lib/utils/ids';
import { createContinuousScale, Scale, ScaleType } from '../lib/utils/scales/scales';
import { computeLineAnnotationDimensions, DEFAULT_LINE_OVERFLOW } from './annotation_utils';

describe('annotation marker', () => {
  const groupId = getGroupId('foo-group');

  const minRange = 0;
  const maxRange = 100;

  const continuousData = [0, 10];
  const continuousScale = createContinuousScale(ScaleType.Linear, continuousData, minRange, maxRange);

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
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
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
    const expectedDimensions = [{
      position: [DEFAULT_LINE_OVERFLOW, 20, 10, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [0, 20, 10, 20],
      marker: {
        icon: <div />,
        transform: 'translate(calc(-16px - 0%),calc(20px - 50%))',
        color: '#000',
      },
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions with marker if defined (x domain)', () => {
    const chartRotation: Rotation = 0;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
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
    const expectedDimensions = [{
      position: [20, -DEFAULT_LINE_OVERFLOW, 20, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [20, 0, 20, 20],
      marker: {
        icon: <div />,
        transform: 'translate(calc(20px - 0%),calc(20px - 50%))',
        color: '#000',
      },
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });
});
