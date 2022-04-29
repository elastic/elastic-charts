/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, MouseEvent, ReactElement, RefObject } from 'react';

import { Shape, TransformMatrix3d } from '..';
import { PositionedElement } from './fixed_canvas_types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { shapeToElement } from './integration_utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { componentLayoutState } from './workpad_interactive_page';
import { localMousePosition } from './workpad_interactive_page/event_handlers';

// converts a transform matrix to a CSS string
const matrixToCSS = (transformMatrix: TransformMatrix3d): string =>
  transformMatrix ? `matrix3d(${transformMatrix.join(',')})` : 'translate3d(0,0,0)';

interface SharedAnnotationProps {
  id: string;
  transformMatrix: TransformMatrix3d;
}

interface AlignmentGuideProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const AlignmentGuide: FC<AlignmentGuideProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasAlignmentGuide canvasInteractable canvasLayoutAnnotation"
    key={id}
    style={{
      background: 'magenta',
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      position: 'absolute',
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);

interface BorderConnectionProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const BorderConnection: FC<BorderConnectionProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasBorderConnection canvasLayoutAnnotation"
    key={id}
    style={{
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      position: 'absolute',
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);

interface BorderResizeHandleProps extends SharedAnnotationProps {
  zoomScale?: number;
}

/** @internal */
export const BorderResizeHandle: FC<BorderResizeHandleProps> = ({ id, transformMatrix, zoomScale = 1 }) => (
  <div
    className="canvasBorderResizeHandle canvasLayoutAnnotation"
    key={id}
    style={{
      transform: `${matrixToCSS(transformMatrix)} scale3d(${1 / zoomScale},${1 / zoomScale}, 1)`,
    }}
  />
);

interface DragBoxAnnotationProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const DragBoxAnnotation: FC<DragBoxAnnotationProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasDragBoxAnnotation canvasLayoutAnnotation"
    key={id}
    style={{
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      transform: matrixToCSS(transformMatrix),
      width,
    }}
  />
);

interface HoverAnnotationProps extends SharedAnnotationProps {
  height: number;
  width: number;
}

/** @internal */
export const HoverAnnotation: FC<HoverAnnotationProps> = ({ id, transformMatrix, width, height }) => (
  <div
    className="canvasHoverAnnotation canvasLayoutAnnotation"
    key={id}
    style={{
      width,
      height,
      marginLeft: -width / 2,
      marginTop: -height / 2,
      transform: matrixToCSS(transformMatrix),
    }}
  />
);

interface RotationHandleProps extends SharedAnnotationProps {
  zoomScale?: number;
}

/** @internal */
export const RotationHandle: FC<RotationHandleProps> = ({ id, transformMatrix, zoomScale = 1 }) => (
  <div className="canvasRotationHandle canvasLayoutAnnotation" style={{ transform: matrixToCSS(transformMatrix) }}>
    <div
      className="canvasRotationHandle__handle"
      key={id}
      style={{ transform: `scale3d(${1 / zoomScale},${1 / zoomScale},1)` }}
    />
  </div>
);

interface TooltipAnnotationProps extends SharedAnnotationProps {
  text: string;
}

/** @internal */
export const TooltipAnnotation: FC<TooltipAnnotationProps> = ({ id, transformMatrix, text }) => {
  return (
    <div
      className="tooltipAnnotation canvasLayoutAnnotation"
      key={id}
      style={{ transform: `${matrixToCSS(transformMatrix)} translate(1em, -1em)` }}
    >
      <p>{text}°</p>
    </div>
  );
};

interface Props extends SharedAnnotationProps {
  children: ReactElement;
  height: number;
  width: number;
}

/** @internal */
export const Positionable: FC<Props> = ({ id, children, transformMatrix, width, height }) => {
  // Throw if there is more than one child
  const childNode = React.Children.only(children);

  const matrix = (transformMatrix.map((n, i) => (i < 12 ? n : Math.round(n))) as any) as TransformMatrix3d;

  return (
    <div
      className="canvasPositionable canvasInteractable"
      key={id}
      style={{
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        position: 'absolute',
        transform: matrixToCSS(matrix),
        border: '1px solid lightgrey',
      }}
    >
      {childNode}
    </div>
  );
};

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
// todo fix the misnomer `shapeToElement` once it's no longer in Kibana
/** @internal */
export const shapeToElementForReal = (shape: Shape) => ({ id: shape.id, position: shapeToElement(shape) });
const chartLookup = {
  sampleElement0: 0,
  sampleElement1: 1,
  sampleElement2: 2,
};

interface CanvasProps {
  chartDescriptors: any;
  charts: any;
}

/**
 * Canvas wrapper
 * @public
 */
export class Canvas extends React.Component {
  private readonly forwardStageRef: RefObject<HTMLDivElement>;
  private store: any;
  private charts: any;

  constructor(props: CanvasProps) {
    super(props);
    this.forwardStageRef = React.createRef();
    this.store = componentLayoutState({
      aeroStore: undefined,
      setAeroStore: () => {},
      elements: props.chartDescriptors,
      selectedToplevelNodes: [],
      height: 800,
      width: 800,
    });
    this.charts = props.charts;
  }

  componentDidMount() {}

  componentDidUpdate() {}

  getRect() {
    return this.forwardStageRef.current?.getBoundingClientRect() ?? { top: NaN, left: NaN };
  }

  onMouseMove({ clientX, clientY, altKey, metaKey, shiftKey, ctrlKey }: MouseEvent<HTMLDivElement>) {
    const { x, y } = localMousePosition(this.getRect.bind(this), clientX, clientY, zoomScale);
    this.store.aeroStore.commit('cursorPosition', { x, y, altKey, metaKey, shiftKey, ctrlKey });
    this.setState({});
  }

  onMouseDown({ clientX, clientY, altKey, metaKey, shiftKey, ctrlKey }: MouseEvent<HTMLDivElement>) {
    const { x, y } = localMousePosition(this.getRect.bind(this), clientX, clientY, zoomScale);
    this.store.aeroStore.commit('mouseEvent', { event: 'mouseDown', x, y, altKey, metaKey, shiftKey, ctrlKey });
    this.setState({});
  }

  onMouseUp({ clientX, clientY, altKey, metaKey, shiftKey, ctrlKey }: MouseEvent<HTMLDivElement>) {
    const { x, y } = localMousePosition(this.getRect.bind(this), clientX, clientY, zoomScale);
    this.store.aeroStore.commit('mouseEvent', { event: 'mouseUp', x, y, altKey, metaKey, shiftKey, ctrlKey });
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
      this.store.aeroStore.commit('actionEvent', { event });
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
          cursor: this.store.aeroStore.getCurrentState().currentScene.cursor,
        }}
      >
        {this.store.aeroStore.getCurrentState().currentScene.shapes.map((shape: Shape, i: number) => {
          const element: PositionedElement = shapeToElementForReal(shape);
          const props = {
            id: `${element.id}_${i}_${shape.subtype}`,
            transformMatrix: shape.transformMatrix,
            text: shape.text,
            ...element.position,
          };

          if (shape.subtype) {
            return LayoutAnnotation(props, shape.subtype);
          }
          return (
            <Positionable key={props.id} {...props}>
              {this.charts.props.children[chartLookup[element.id]]}
            </Positionable>
          );
        })}
      </div>
    );
  }
}
