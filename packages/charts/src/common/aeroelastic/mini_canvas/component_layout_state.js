/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { updater } from '../layout';
import { createStore } from '../store';
import { shapesForNodes } from './integration_utils';

const configuration = {
  getAdHocChildAnnotationName: 'adHocChildAnnotation',
  adHocGroupName: 'adHocGroup',
  alignmentGuideName: 'alignmentGuide',
  atopZ: 1000,
  depthSelect: true,
  devColor: 'magenta',
  dragBoxAnnotationName: 'dragBoxAnnotation',
  dragBoxZ: 1050, // above alignment guides but below the upcoming hover tooltip
  groupName: 'group',
  groupResize: true,
  guideDistance: 8, // in Kibana canvas: apparently 3
  hoverAnnotationName: 'hoverAnnotation',
  hoverLift: 100,
  intraGroupManipulation: false,
  intraGroupSnapOnly: false,
  minimumElementSize: 2,
  persistentGroupName: 'persistentGroup',
  resizeAnnotationConnectorOffset: 0,
  resizeAnnotationOffset: 0,
  resizeAnnotationOffsetZ: 0.1, // causes resize markers to be slightly above the shape plane
  resizeAnnotationSize: 10,
  resizeConnectorName: 'resizeConnector',
  resizeHandleName: 'resizeHandle',
  rotateAnnotationOffset: 12,
  rotateSnapInPixels: 10,
  rotationEpsilon: 0.001,
  rotationHandleName: 'rotationHandle',
  rotationHandleSize: 14,
  rotationTooltipName: 'rotationTooltip',
  shortcuts: false,
  singleSelect: false,
  snapConstraint: true,
  tooltipZ: 1100,
};

/** @internal */
export const componentLayoutState = ({ aeroStore, setAeroStore, elements, selectedToplevelNodes, height, width }) => {
  const shapes = shapesForNodes(elements);
  const selectedShapes = selectedToplevelNodes.filter((e) => shapes.find((s) => s.id === e));
  const newState = {
    primaryUpdate: null,
    currentScene: {
      shapes,
      configuration: { ...configuration, pageHeight: height, pageWidth: width },
      selectedShapes,
      selectionState: aeroStore
        ? aeroStore.getCurrentState().currentScene.selectionState
        : { uid: 0, depthIndex: 0, down: false },
      gestureState: aeroStore
        ? aeroStore.getCurrentState().currentScene.gestureState
        : {
            cursor: { x: Infinity, y: Infinity },
            mouseIsDown: false,
            mouseButtonState: { buttonState: 'up', downX: null, downY: null },
          },
    },
  };
  if (aeroStore) {
    aeroStore.setCurrentState(newState);
  } else {
    setAeroStore((aeroStore = createStore(newState, updater)));
  }
  return { aeroStore };
};
