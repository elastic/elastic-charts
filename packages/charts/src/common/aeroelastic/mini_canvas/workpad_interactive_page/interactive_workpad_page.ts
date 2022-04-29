/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { PureComponent } from 'react';

// import { WorkpadShortcuts } from '../../workpad_shortcuts';
import { ElementWrapper } from '../element_wrapper';
import {
  AlignmentGuide,
  DragBoxAnnotation,
  HoverAnnotation,
  TooltipAnnotation,
  RotationHandle,
  BorderConnection,
  BorderResizeHandle,
} from '../view_components';
// import { interactiveWorkpadPagePropTypes } from '../prop_types';
// import { InteractionBoundary } from './interaction_boundary';

/** @internal */
export function LayoutAnnotation(element, subtype) {
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

/** @internal */
export class InteractiveWorkpadPage extends PureComponent {
  // static propTypes = interactiveWorkpadPagePropTypes;

  componentWillUnmount() {
    this.props.resetHandler();
  }

  render() {
    const {
      pageId,
      pageStyle,
      className,
      elements,
      cursor = 'auto',
      height,
      width,
      onDoubleClick,
      onKeyDown,
      onMouseDown,
      onMouseLeave,
      onMouseMove,
      onMouseUp,
      onAnimationEnd,
      onWheel,
      selectedNodes,
      selectToplevelNodes,
      insertNodes,
      removeNodes,
      elementLayer,
      canvasOrigin,
      saveCanvasOrigin,
      commit,
      setMultiplePositions,
      zoomScale,
    } = this.props;

    let shortcuts = null;

    const shortcutProps = {
      elementLayer,
      insertNodes,
      pageId,
      removeNodes,
      selectedNodes,
      selectToplevelNodes,
      commit,
      setMultiplePositions,
    };
    // shortcuts = <WorkpadShortcuts {...shortcutProps} />;

    return (
      <div
        key={pageId}
        id={pageId}
        ref={(node) => {
          if (!canvasOrigin && node && node.getBoundingClientRect) {
            saveCanvasOrigin(() => () => node.getBoundingClientRect());
          }
        }}
        data-test-subj="canvasWorkpadPage"
        className={`canvasPage kbn-resetFocusState canvasInteractivePage ${className}`}
        data-shared-items-container
        style={{ ...pageStyle, height, width, cursor }}
        onKeyDown={onKeyDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
        onAnimationEnd={onAnimationEnd}
        onWheel={onWheel}
      >
        {/*<InteractionBoundary />*/}
        {shortcuts}
        {elements
          .map((node) => {
            if (node.type === 'annotation') {
              const props = {
                key: node.id,
                type: node.type,
                transformMatrix: node.transformMatrix,
                width: node.width,
                height: node.height,
                text: node.text,
                zoomScale,
              };
              return layoutAnnotation(props, node.subtype);
            } else if (node.type !== 'group') {
              return <ElementWrapper key={node.id} element={node} />;
            }
          })
          .filter((element) => !!element)}
      </div>
    );
  }
}
