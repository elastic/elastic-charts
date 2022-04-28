/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { arrayToMap, flatten, identity, shallowEqual } from '../functional';
import { getLocalTransformMatrix } from '../layout_functions';
import { matrixToAngle } from '../matrix';
import { isGroupId, elementToShape } from './positioning_utils';
// import { PositionedElement } from './fixed_canvas_types'

/*** TEMPORARY IMPORT PLACEHOLDERS *********************************************************************************/

// based on https://github.com/elastic/kibana/blob/main/x-pack/plugins/canvas/public/state/selectors/workpad.ts
const getNodes /*: (state: State, page: string) => CanvasElement[] | PositionedElement[] */ = () => [];
const getSelectedPage /*: (state: State) => string */ = () => '';

// based on https://github.com/elastic/kibana/blob/main/x-pack/plugins/canvas/public/state/actions/elements.js
const addElement = (page /*: string*/, partialElement /*: PositionedElement */) /*: Action */ => {
  return { action: 'addElement', payload: { page, partialElement } };
};
const removeElements = (arrayOfElementIds /*: CanvasElement["id"][] */, page /*: string */) /*: Action */ => {
  return { action: 'removeElements', payload: { page, arrayOfElementIds } };
};
const setMultiplePositions = (
  repositionings /*: Array<{position: ElementPosition, elementId: string}> */,
) /*: Action */ => {
  return { action: 'setMultiplePositions', payload: { repositionings } };
};

const selectToplevelNodes = (shapeArray /*: Shape[] */) /*: Action */ => {
  return { action: 'selectToplevelNodes', payload: { shapeArray } };
};

/*
const dispatch = ({ action, payload } /!*: Action *!/) /!*: void *!/ => {
  console.log({ action, payload: JSON.stringify(payload) });
};
*/

/***  TEMPORARY IMPORT PLACEHOLDERS END ****************************************************************************/

/** @internal */
export const shapeToElement = (shape) => ({
  left: shape.transformMatrix[12] - shape.a,
  top: shape.transformMatrix[13] - shape.b,
  width: shape.a * 2,
  height: shape.b * 2,
  angle: Math.round((matrixToAngle(shape.transformMatrix) * 180) / Math.PI),
  parent: shape.parent || null,
  type: shape.type === 'group' ? 'group' : 'element',
});

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
  guideDistance: 3,
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



const ascending = (a, b) => (a.id < b.id ? -1 : 1);
const relevant = (s) => s.type !== 'annotation' && s.subtype !== 'adHocGroup';

// eslint-disable-next-line no-shadow
const globalPositionUpdates = (setMultiplePositions, { shapes, gestureEnd }, unsortedElements) => {
  const elements = unsortedElements.filter(relevant).sort(ascending);
  const repositionings = shapes
    .filter(relevant)
    .sort(ascending)
    .map((shape, i) => {
      const element = elements[i];
      const elemPos = element && element.position;
      if (elemPos && gestureEnd) {
        // get existing position information from element
        const oldProps = {
          left: elemPos.left,
          top: elemPos.top,
          width: elemPos.width,
          height: elemPos.height,
          angle: Math.round(elemPos.angle),
          type: elemPos.type,
          parent: elemPos.parent || null,
        };

        // cast shape into element-like object to compare
        const newProps = shapeToElement(shape);

        if (1 / newProps.angle === -Infinity) {
          newProps.angle = 0;
        } // recompose.shallowEqual discerns between 0 and -0

        return shallowEqual(oldProps, newProps) ? null : { position: newProps, elementId: shape.id };
      }
    })
    .filter(identity);
  return repositionings;
};

const dedupe = (d, i, a) => a.findIndex((s) => s.id === d.id) === i;

const missingParentCheck = (groups) => {
  const idMap = arrayToMap(groups.map((g) => g.id));
  groups.forEach((g) => {
    if (g.parent && !idMap[g.parent]) g.parent = null;
  });
};

/** @internal */
export const shapesForNodes = (nodes) => {
  // For a group, it's z-layer should be the same as the highest of it's children
  // So we cache every nodes layer in this array so when we get to a group
  // we can refer back to all of the elements and figure out the appropriate layer
  // for the group
  const nodeLayers = nodes.map(() => null);

  const getNodeLayer = (nodeIndex) => {
    if (nodeLayers[nodeIndex]) {
      return nodeLayers[nodeIndex];
    }

    const node = nodes[nodeIndex];
    const thisId = node.id;

    const childrenIndexesOfThisNode = nodes
      .map((n, i) => [n, i])
      // eslint-disable-next-line no-shadow
      .filter(([node]) => node.position.parent === thisId)
      .map(([, index]) => index);

    if (childrenIndexesOfThisNode.length === 0) {
      nodeLayers[nodeIndex] = nodeIndex;
    } else {
      const layer = Math.max(...childrenIndexesOfThisNode.map(getNodeLayer));
      nodeLayers[nodeIndex] = layer;
    }

    return nodeLayers[nodeIndex];
  };

  const rawShapes = nodes
    .map((node, index) => {
      const layer = getNodeLayer(index);
      return elementToShape(node, layer);
    })
    // filtering to eliminate residual element of a possible group that had been deleted in Redux
    .filter((d, i, a) => !isGroupId(d.id) || a.find((s) => s.parent === d.id))
    .filter(dedupe);
  missingParentCheck(rawShapes);
  const getLocalMatrix = getLocalTransformMatrix(rawShapes);
  return rawShapes.map((s) => ({ ...s, localTransformMatrix: getLocalMatrix(s) }));
};

// eslint-disable-next-line no-shadow
const updateGlobalPositionsInRedux = (setMultiplePositions, scene, unsortedElements) => {
  const repositionings = globalPositionUpdates(setMultiplePositions, scene, unsortedElements);
  if (repositionings.length > 0) {
    setMultiplePositions(repositionings);
  }
};

/** @internal */
export const globalStateUpdater = (dispatch, globalState) => (state) => {
  const nextScene = state.currentScene;
  const page = getSelectedPage(globalState);
  const elements = getNodes(globalState, page);
  const { shapes } = nextScene;
  const persistableGroups = shapes.filter((s) => s.subtype === 'persistentGroup').filter(dedupe);
  const persistedGroups = elements.filter((e) => isGroupId(e.id)).filter(dedupe);

  persistableGroups.forEach((g) => {
    if (
      !persistedGroups.some((p) => {
        if (!p.id) {
          throw new Error('Element has no id');
        }
        return p.id === g.id;
      })
    ) {
      const partialElement = {
        id: g.id,
        position: shapeToElement(g),
      };
      dispatch(addElement(page, partialElement));
    }
  });

  const elementsToRemove = persistedGroups.filter(
    // list elements for removal if they're not in the persistable set, or if there's no longer an associated element
    // the latter of which shouldn't happen, so it's belts and braces
    (p) => !persistableGroups.some((g) => p.id === g.id) || !elements.some((e) => e.position.parent === p.id),
  );

  updateGlobalPositionsInRedux(
    (positions) => dispatch(setMultiplePositions(positions.map((p) => ({ ...p, pageId: page })))),
    nextScene,
    elements,
  );

  if (elementsToRemove.length > 0) {
    // remove elements for groups that were ungrouped
    dispatch(
      removeElements(
        elementsToRemove.map((e) => e.id),
        page,
      ),
    );
  }

  // set the selected element on the global store, if one element is selected
  const { selectedPrimaryShapes } = nextScene;
  if (!shallowEqual(selectedPrimaryShapes, globalState.transient.selectedToplevelNodes)) {
    dispatch(
      selectToplevelNodes(
        selectedPrimaryShapes.flatMap((n) =>
          n.startsWith('group') && (shapes.find((s) => s.id === n) || {}).subtype === 'adHocGroup'
            ? shapes.filter((s) => s.type !== 'annotation' && s.parent === n).map((s) => s.id)
            : [n],
        ),
      ),
    );
  }
};

/** @internal */
export const crawlTree = (shapes) => (shapeId) => {
  // eslint-disable-next-line no-shadow
  const rec = (shapeId) => [
    shapeId,
    ...flatten(shapes.filter((s) => s.position.parent === shapeId).map((s) => rec(s.id))),
  ];
  return rec(shapeId);
};
