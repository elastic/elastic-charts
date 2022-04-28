/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { MouseEvent, RefObject } from 'react';

import {
  AlignmentGuide,
  DragBoxAnnotation,
  HoverAnnotation,
  TooltipAnnotation,
  RotationHandle,
  BorderConnection,
  BorderResizeHandle,
} from '@elastic/charts/dist/common/aeroelastic/mini_canvas/layout_annotations';
import { Shape } from '@elastic/charts/src/common/aeroelastic';
import { translate } from '@elastic/charts/src/common/aeroelastic/matrix';
import { PositionedElement } from '@elastic/charts/src/common/aeroelastic/mini_canvas/fixed_canvas_types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { shapeToElement } from '@elastic/charts/src/common/aeroelastic/mini_canvas/integration_utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-duplicates
import { componentLayoutState } from '@elastic/charts/src/common/aeroelastic/mini_canvas/workpad_interactive_page';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-duplicates
// import { LayoutAnnotation } from '@elastic/charts/src/common/aeroelastic/mini_canvas/workpad_interactive_page';
import { localMousePosition } from '@elastic/charts/src/common/aeroelastic/mini_canvas/workpad_interactive_page/event_handlers';

import { Example as TimeslipExample } from '../area/21_with_time_timeslip.story';
import { Example as SmallMultiplesExample } from '../small_multiples/6_heterogeneous_cartesians.story';
import { Example as TreemapExample } from '../treemap/2_one_layer_2.story';

function LayoutAnnotation(element, subtype) {
  switch (subtype) {
    case 'alignmentGuide':
      return <AlignmentGuide {...element} />;
    case 'adHocChildAnnotation': // now sharing aesthetics but may diverge in the future
    case 'hoverAnnotation': // fixme: with the upcoming TS work, use enumerative types here
      return <HoverAnnotation {...element} />;
    case 'dragBoxAnnotation':
      return <DragBoxAnnotation {...element} />;
    case 'rotationHandle':
      return <RotationHandle {...element} />;
    case 'resizeHandle':
      return <BorderResizeHandle {...element} />;
    case 'resizeConnector':
      return <BorderConnection {...element} />;
    case 'rotationTooltip':
      return <TooltipAnnotation {...element} />;
    default:
      return [];
  }
}

const zoomScale = 1; // could be `dpr` in the future, for standardized css pixel

const canvasSizeCss = 800;
const width = canvasSizeCss;
const height = canvasSizeCss;

const charts = (
  <>
    <SmallMultiplesExample />
    <TreemapExample />
    <TimeslipExample />
  </>
);

const sampleShape0: Shape = {
  id: 'sampleElement0',
  type: 'rectangleElement',
  subtype: '',
  parent: null,
  transformMatrix: translate(width / 1.4, height / 2, 0),
  a: width / 3,
  b: height / 4,
};

const sampleShape1: Shape = {
  id: 'sampleElement1',
  type: 'rectangleElement',
  subtype: '',
  parent: null,
  transformMatrix: translate(width / 5, height / 1.3, 0),
  a: width / 6,
  b: height / 8,
};

const sampleShape2: Shape = {
  id: 'sampleElement2',
  type: 'rectangleElement',
  subtype: '',
  parent: null,
  transformMatrix: translate(width / 2.5, height / 5, 0),
  a: width / 3,
  b: height / 8,
};

// todo fix the misnomer `shapeToElement` once it's no longer in Kibana
const shapeToElementForReal = (shape: Shape) => ({ id: shape.id, position: shapeToElement(shape) });

const sampleShapes = [sampleShape0, sampleShape1, sampleShape2];
const sampleElements = sampleShapes.map(shapeToElementForReal);

const chartLookup = {
  sampleElement0: 0,
  sampleElement1: 1,
  sampleElement2: 2,
};

let currentState = undefined;
const setAeroStore = (state) => (currentState = state);

const store = componentLayoutState({
  aeroStore: undefined,
  setAeroStore,
  elements: sampleElements,
  selectedToplevelNodes: [],
  height: height,
  width: width,
});

type CanvasProps = Record<string, never>;

class Canvas extends React.Component {
  private readonly forwardStageRef: RefObject<HTMLDivElement>;

  constructor(props: CanvasProps) {
    super(props);
    this.forwardStageRef = React.createRef();
  }

  componentDidMount() {}

  componentDidUpdate() {}

  getRect() {
    return this.forwardStageRef.current?.getBoundingClientRect() ?? { top: NaN, left: NaN };
  }

  onMouseMove({ clientX, clientY, altKey, metaKey, shiftKey, ctrlKey }: MouseEvent<HTMLDivElement>) {
    const { x, y } = localMousePosition(this.getRect.bind(this), clientX, clientY, zoomScale);
    store.aeroStore.commit('cursorPosition', { x, y, altKey, metaKey, shiftKey, ctrlKey });
    this.setState({});
  }

  onMouseDown({ clientX, clientY, altKey, metaKey, shiftKey, ctrlKey }: MouseEvent<HTMLDivElement>) {
    const { x, y } = localMousePosition(this.getRect.bind(this), clientX, clientY, zoomScale);
    store.aeroStore.commit('mouseEvent', { event: 'mouseDown', x, y, altKey, metaKey, shiftKey, ctrlKey });
    this.setState({});
  }

  onMouseUp({ clientX, clientY, altKey, metaKey, shiftKey, ctrlKey }: MouseEvent<HTMLDivElement>) {
    const { x, y } = localMousePosition(this.getRect.bind(this), clientX, clientY, zoomScale);
    store.aeroStore.commit('mouseEvent', { event: 'mouseUp', x, y, altKey, metaKey, shiftKey, ctrlKey });
    this.setState({});
  }

  onKeyPress(keyEvent: KeyboardEvent) {
    // see for more interactions, many of them not aeroelastic actions: https://github.com/elastic/kibana/blob/6693ef371f887eca639b09c4c9b15701b4ebabd4/x-pack/plugins/canvas/public/lib/element_handler_creators.ts
    const event = {
      g: 'group',
      u: 'ungroup',
      a: 'alignLeft',
      s: 'alignCenter',
      d: 'alignRight',
      w: 'alignTop',
      m: 'alignMiddle',
      z: 'alignBottom',
      h: 'distributeHorizontally',
      v: 'distributeVertically',
    }[keyEvent.key];
    if (event) {
      // keyEvent.preventDefault();
      keyEvent.stopPropagation();
      store.aeroStore.commit('actionEvent', { event });
      this.setState({});
    }
  }

  render() {
    return (
      <div
        className="canvasPage canvasPage canvasInteractivePage"
        ref={this.forwardStageRef}
        role="presentation"
        tabIndex={0}
        // mouse events: check this for more subtlety https://github.com/elastic/kibana/blob/6693ef371f887eca639b09c4c9b15701b4ebabd4/x-pack/plugins/canvas/public/components/workpad_page/workpad_interactive_page/event_handlers.ts
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onKeyDown={this.onKeyPress.bind(this)}
        style={{
          position: 'absolute',
          top: -50,
          left: 0,
          width: 'calc(100% - 0px)',
          height: '200%',
          background: 'white',
          outline: 'none',
          border: '4px solid blanchedalmond',
          borderRadius: 40,
          cursor: store.aeroStore.getCurrentState().currentScene.cursor,
        }}
      >
        {store.aeroStore.getCurrentState().currentScene.shapes.map((shape: Shape, i: number) => {
          const element: PositionedElement = shapeToElementForReal(shape);
          const { left, top, width, height, angle } = element.position;
          const centerX = left + width / 2;
          const centerY = top + height / 2;

          if (shape.subtype) {
            return LayoutAnnotation(
              {
                id: `${element.id}_${i}`,
                transformMatrix: shape.transformMatrix,
                ...element.position,
              },
              shape.subtype,
            );
          }
          return (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                transform: `translate(${centerX}px, ${centerY}px) rotate(${angle}deg)`, // todo: use `matrixToCSS` for generality
                transformOrigin: 'center',
                left: -width / 2,
                top: -height / 2,
                width,
                height,
                background: 'rgba(0, 0, 0, 0)',
                border: '1px solid lightgrey',
              }}
            >
              {charts.props.children[chartLookup[element.id]]}
            </div>
          );
        })}
      </div>
    );
  }
}

export const Example = () => <Canvas></Canvas>;

Example.parameters = {
  background: { default: 'white' },
};
