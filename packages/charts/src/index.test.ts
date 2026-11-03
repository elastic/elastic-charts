/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// Importing the public barrel is the point of this test: type-only re-exports
// (`export type { Foo }`) would make these undefined at runtime.
/* eslint-disable import/no-restricted-paths -- asserts @elastic/charts barrel value exports */
import {
  AnimationSpeed,
  AnnotationAnimationTrigger,
  AnnotationDomainType,
  AnnotationType,
  BandedAccessorType,
  BinAgg,
  BrushAxis,
  BulletSubtype,
  ChartType,
  ColorBandValueType,
  ColorVariant,
  CurveType,
  Direction,
  DomainPaddingUnit,
  Fit,
  GoalSubtype,
  HistogramModeAlignments,
  HorizontalAlignment,
  LabelOverflowConstraint,
  LayoutDirection,
  LegendLayout,
  LegendStrategy,
  LegendValue,
  MeterFillStyle,
  MeterSize,
  MetricTrendShape,
  PartitionLayout,
  Placement,
  PointerEventType,
  PointerUpdateTrigger,
  PointShape,
  Position,
  Predicate,
  ScaleType,
  SeriesType,
  SpecType,
  StackMode,
  TextureShape,
  TimeFunction,
  TooltipStickTo,
  TooltipType,
  VerticalAlignment,
  WeightFn,
} from '.';
/* eslint-enable import/no-restricted-paths */

const publicFrozenEnums = {
  AnimationSpeed,
  AnnotationAnimationTrigger,
  AnnotationDomainType,
  AnnotationType,
  BandedAccessorType,
  BinAgg,
  BrushAxis,
  BulletSubtype,
  ChartType,
  ColorBandValueType,
  ColorVariant,
  CurveType,
  Direction,
  DomainPaddingUnit,
  Fit,
  GoalSubtype,
  HistogramModeAlignments,
  HorizontalAlignment,
  LabelOverflowConstraint,
  LayoutDirection,
  LegendLayout,
  LegendStrategy,
  LegendValue,
  MeterFillStyle,
  MeterSize,
  MetricTrendShape,
  PartitionLayout,
  Placement,
  PointerEventType,
  PointerUpdateTrigger,
  PointShape,
  Position,
  Predicate,
  ScaleType,
  SeriesType,
  SpecType,
  StackMode,
  TextureShape,
  TimeFunction,
  TooltipStickTo,
  TooltipType,
  VerticalAlignment,
  WeightFn,
};

describe('public frozen enums', () => {
  it.each(Object.entries(publicFrozenEnums))('%s is exported as a frozen runtime object', (_name, value) => {
    expect(value).toEqual(expect.any(Object));
    expect(Object.isFrozen(value)).toBe(true);
  });
});
