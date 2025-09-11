/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import type { AnnotationLineProps } from './types';
import { ChartType } from '../../..';
import { Chart } from '../../../../components/chart';
import { MockAnnotationLineProps, MockAnnotationRectProps } from '../../../../mocks/annotations/annotations';
import { ScaleType } from '../../../../scales/constants';
import { Settings } from '../../../../specs/settings';
import { SpecType } from '../../../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import type { AnnotationId } from '../../../../utils/ids';
import { LineAnnotation } from '../../specs/line_annotation';
import { LineSeries } from '../../specs/line_series';
import type { RectAnnotationSpec } from '../../utils/specs';
import { AnnotationDomainType, AnnotationType } from '../../utils/specs';
import { computeRectAnnotationTooltipState } from '../tooltip';
import type { AnnotationDimensions } from '../types';

describe('Annotation tooltips', () => {
  describe('Line annotation tooltips', () => {
    test('should show tooltip on mouseenter', () => {
      render(
        <Chart size={[100, 100]}>
          <Settings
            theme={{
              chartMargins: { left: 0, right: 0, top: 0, bottom: 0 },
              chartPaddings: { left: 0, right: 0, top: 0, bottom: 0 },
            }}
          />
          <LineSeries
            id="line"
            data={[
              { x: 0, y: 1 },
              { x: 2, y: 3 },
              { x: 4, y: 5 },
            ]}
            xAccessor="x"
            yAccessors={['y']}
            xScaleType={ScaleType.Linear}
          />
          <LineAnnotation
            id="foo"
            domainType={AnnotationDomainType.YDomain}
            dataValues={[{ dataValue: 2, details: 'foo' }]}
            marker={<div style={{ width: '10px', height: '10px' }} />}
          />
        </Chart>,
      );

      expect(screen.queryByTestId('echAnnotationMarker')).not.toBeNull();
      const marker = screen.getByTestId('echAnnotationMarker');
      expect(screen.queryAllByTestId('echAnnotation')).toHaveLength(0);

      if (marker) fireEvent.mouseEnter(marker);

      expect(screen.queryByTestId('echTooltip')).not.toBeNull();
      expect(screen.getByTestId('echTooltipHeader').textContent).toBe('2');
      expect(screen.getByTestId('echAnnotationDetails').textContent).toBe('foo');

      if (marker) fireEvent.mouseLeave(marker);
      expect(screen.queryByTestId('echTooltipHeader')).toBeNull();
    });

    test('should not show tooltip when using hideTooltips', () => {
      render(
        <Chart size={[100, 100]}>
          <Settings
            theme={{
              chartMargins: { left: 0, right: 0, top: 0, bottom: 0 },
              chartPaddings: { left: 0, right: 0, top: 0, bottom: 0 },
            }}
          />
          <LineSeries
            id="line"
            data={[
              { x: 0, y: 1 },
              { x: 2, y: 3 },
              { x: 4, y: 5 },
            ]}
            xAccessor="x"
            yAccessors={['y']}
            xScaleType={ScaleType.Linear}
          />
          <LineAnnotation
            id="foo"
            domainType={AnnotationDomainType.YDomain}
            dataValues={[{ dataValue: 2, details: 'foo' }]}
            marker={<div style={{ width: '10px', height: '10px' }} />}
            hideTooltips
          />
        </Chart>,
      );

      expect(screen.queryAllByTestId('echAnnotation')).toHaveLength(0);
      const marker = screen.getByTestId('echAnnotationMarker');
      if (marker) fireEvent.mouseEnter(marker);

      expect(screen.queryByTestId('echTooltip')).toBeNull();
    });
  });

  test('should compute the tooltip state for rect annotation', () => {
    const groupId = 'foo-group';
    const chartDimensions: Dimensions = {
      width: 10,
      height: 20,
      top: 5,
      left: 15,
    };
    const annotationLines: AnnotationLineProps[] = [
      MockAnnotationLineProps.default({
        specId: 'foo',
        linePathPoints: {
          x1: 1,
          y1: 2,
          x2: 3,
          y2: 4,
        },
        markers: [
          {
            icon: React.createElement('div'),
            color: 'red',
            dimension: { width: 10, height: 10 },
            position: { top: 0, left: 0 },
          },
        ],
      }),
    ];
    const chartRotation: Rotation = 0;

    const annotationDimensions = new Map<AnnotationId, AnnotationDimensions>();
    annotationDimensions.set('foo', annotationLines);

    // rect annotation tooltip
    const annotationRectangle: RectAnnotationSpec = {
      chartType: ChartType.XYAxis,
      specType: SpecType.Annotation,
      id: 'rect',
      groupId,
      annotationType: AnnotationType.Rectangle,
      dataValues: [{ coordinates: { x0: 1, x1: 2, y0: 3, y1: 5 } }],
    };

    const rectAnnotations: RectAnnotationSpec[] = [];
    rectAnnotations.push(annotationRectangle);

    annotationDimensions.set(annotationRectangle.id, [
      MockAnnotationRectProps.default({ rect: { x: 2, y: 3, width: 3, height: 5 } }),
    ]);

    const rectTooltipState = computeRectAnnotationTooltipState(
      { x: 18, y: 9 },
      annotationDimensions,
      rectAnnotations,
      chartRotation,
      chartDimensions,
    );

    expect(rectTooltipState).toMatchObject({
      isVisible: true,
      annotationType: AnnotationType.Rectangle,
      anchor: {
        x: 18,
        y: 9,
        width: 0,
        height: 0,
      },
    });
    annotationRectangle.hideTooltips = true;

    const rectHideTooltipState = computeRectAnnotationTooltipState(
      { x: 3, y: 4 },
      annotationDimensions,
      rectAnnotations,
      chartRotation,
      chartDimensions,
    );

    expect(rectHideTooltipState).toBe(null);
  });
});
