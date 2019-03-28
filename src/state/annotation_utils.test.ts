import { AnnotationDomainType, AnnotationSpec, AnnotationType, Rotation } from '../lib/series/specs';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId, getAnnotationId, getGroupId, GroupId } from '../lib/utils/ids';
import { createContinuousScale, createOrdinalScale, Scale, ScaleType } from '../lib/utils/scales/scales';
import { computeAnnotationDimensions, computeLineAnnotationDimensions } from './annotation_utils';

describe('annotation utils', () => {
  const minRange = 0;
  const maxRange = 100;

  const continuousData = [0, 10];
  const continuousScale = createContinuousScale(ScaleType.Linear, continuousData, minRange, maxRange);

  const ordinalData = ['a', 'b', 'c', 'd', 'a', 'b', 'c'];
  const ordinalScale = createOrdinalScale(ordinalData, minRange, maxRange);

  const chartDimensions: Dimensions = {
    width: 10,
    height: 20,
    top: 5,
    left: 15,
  };

  test('should compute annotation dimensions', () => {
    const groupId = getGroupId('foo-group');

    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotations: Map<AnnotationId, AnnotationSpec> = new Map();
    const annotationId = getAnnotationId('foo');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
    };

    annotations.set(annotationId, lineAnnotation);

    const dimensions = computeAnnotationDimensions(
      annotations,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = new Map();
    expectedDimensions.set(annotationId, [{ position: [0, 20, 10, 20], details: { detailsText: 'foo' } }]);
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for yDomain on a yScale (chartRotation 0)', () => {
    const groupId = getGroupId('foo-group');

    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = [{ position: [0, 20, 10, 20], details: { detailsText: 'foo' } }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for yDomain on a yScale (chartRotation 90)', () => {
    const groupId = getGroupId('foo-group');
    const chartRotation: Rotation = 90;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = [{ position: [20, 0, 20, 20], details: { detailsText: 'foo' } }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should not compute line annotation dimensions for yDomain if no corresponding yScale', () => {
    const groupId = getGroupId('foo-group');

    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.YDomain,
      dataValues: [],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    expect(dimensions).toEqual(null);
  });

  test('should compute line annotation dimensions for xDomain (chartRotation 0, ordinal scale)', () => {
    const groupId = getGroupId('foo-group');

    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.XDomain,
      dataValues: [{ dataValue: 'a', details: 'foo' }],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = [{ position: [12.5, 0, 12.5, 20], details: { detailsText: 'foo' } }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain (chartRotation 0, continuous scale)', () => {
    const groupId = getGroupId('foo-group');

    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = continuousScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = [{ position: [20, 0, 20, 20], details: { detailsText: 'foo' } }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain on a xScale (chartRotation 90, ordinal scale)', () => {
    const groupId = getGroupId('foo-group');
    const chartRotation: Rotation = 90;
    const yScales: Map<GroupId, Scale> = new Map();

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.XDomain,
      dataValues: [{ dataValue: 'a', details: 'foo' }],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = [{ position: [0, 12.5, 10, 12.5], details: { detailsText: 'foo' } }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain on a xScale (chartRotation 90, continuous scale)', () => {
    const groupId = getGroupId('foo-group');
    const chartRotation: Rotation = 90;
    const yScales: Map<GroupId, Scale> = new Map();

    const xScale: Scale = continuousScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationType.Line,
      annotationId,
      domainType: AnnotationDomainType.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
    );
    const expectedDimensions = [{ position: [0, 20, 10, 20], details: { detailsText: 'foo' } }];
    expect(dimensions).toEqual(expectedDimensions);
  });
});
