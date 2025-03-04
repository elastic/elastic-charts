/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { SeriesIdentifier } from './series_id';
import type { LayerValue, SettingsSpec } from '../specs';
import type { Spec } from '../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import type { PointerStates } from '../state/pointer_states';
import { isClicking } from '../state/utils/is_clicking';

// todo revise all the complex branching in this file, replace some `if`s and multiple return points with ternaries

/** @internal */
export const getOnElementClickSelector =
  (prev: { click: PointerStates['lastClick'] }) =>
  (
    spec: Spec | null,
    lastClick: PointerStates['lastClick'],
    settings: SettingsSpec,
    pickedShapes: LayerValue[][],
  ): void => {
    if (!spec) {
      return;
    }
    if (!settings.onElementClick) {
      return;
    }
    const nextPickedShapesLength = pickedShapes.length;
    if (nextPickedShapesLength > 0 && isClicking(prev.click, lastClick) && settings && settings.onElementClick) {
      const elements = pickedShapes.map<[LayerValue[], SeriesIdentifier]>((values) => [
        values,
        {
          specId: spec.id,
          key: `spec{${spec.id}}`,
        },
      ]);
      settings.onElementClick(elements);
    }
    prev.click = lastClick;
  };

/** @internal */
export const getOnElementOutSelector =
  (prev: { pickedShapes: number | null }) =>
  (spec: Spec | null, pickedShapes: LayerValue[][], settings: SettingsSpec): void => {
    if (!spec) {
      return;
    }
    if (!settings.onElementOut) {
      return;
    }
    const nextPickedShapes = pickedShapes.length;

    if (prev.pickedShapes !== null && prev.pickedShapes > 0 && nextPickedShapes === 0) {
      settings.onElementOut();
    }
    prev.pickedShapes = nextPickedShapes;
  };

function isNewPickedShapes(prevPickedShapes: LayerValue[][], nextPickedShapes: LayerValue[][]) {
  if (nextPickedShapes.length === 0) {
    return;
  }
  if (nextPickedShapes.length !== prevPickedShapes.length) {
    return true;
  }
  return !nextPickedShapes.every((nextPickedShapeValues, index) => {
    const prevPickedShapeValues = prevPickedShapes[index];
    if (!prevPickedShapeValues) {
      return false;
    }
    if (prevPickedShapeValues.length !== nextPickedShapeValues.length) {
      return false;
    }
    return nextPickedShapeValues.every((layerValue, i) => {
      const prevPickedValue = prevPickedShapeValues[i];
      if (!prevPickedValue) {
        return false;
      }
      return layerValue.value === prevPickedValue.value && layerValue.groupByRollup === prevPickedValue.groupByRollup;
    });
  });
}

/** @internal */
export const getOnElementOverSelector =
  (prev: { pickedShapes: LayerValue[][] }) =>
  (spec: Spec | null, nextPickedShapes: LayerValue[][], settings: SettingsSpec): void => {
    if (!spec || !settings.onElementOver) return;
    if (isNewPickedShapes(prev.pickedShapes, nextPickedShapes)) {
      const elements = nextPickedShapes.map<[LayerValue[], SeriesIdentifier]>((values) => [
        values,
        {
          specId: spec.id,
          key: `spec{${spec.id}}`,
        },
      ]);
      settings.onElementOver(elements);
    }
    prev.pickedShapes = nextPickedShapes;
  };
