/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import classNames from 'classnames';
import React, { useRef, useEffect, useCallback, ReactNode, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { createPopper, Instance } from '@popperjs/core/lib/popper-lite.js';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import popperOffset from '@popperjs/core/lib/modifiers/offset.js';
import popperFlip from '@popperjs/core/lib/modifiers/flip.js';

import { Position, mergePartial } from '../../utils/commons';
import { isDefined } from '../../chart_types/xy_chart/state/utils';

const DEFAULT_POPPER_SETTINGS: PopperSettings = {
  fallbackPlacements: [Position.Right, Position.Left, Position.Top, Position.Bottom],
  placement: Position.Right,
  offset: 10,
};

/** @internal */
export interface PopperSettings {
  fallbackPlacements: Position[];
  placement: Position;
  boundary?: HTMLElement;
  offset?: number;
}

/** @internal */
export interface AnchorPosition {
  left: number;
  top: number;
  width?: number;
  height?: number;
}

/**
 * Used to position tooltip relative to invisible anchor via ref element
 */
interface PortalAnchorRefProps {
  /**
   * Positioning values relative to `anchorRef`. Return `null` if tooltip is not visible.
   */
  position?: AnchorPosition | null;
  /**
   * Anchor ref element to use as position reference
   *
   * @default document.body
   */
  anchorRef?: HTMLElement | null;
}

/**
 * Used to position tooltip relative to dom anchor
 */
interface PortalAnchorProps {
  /**
   * Anchor element to use as position reference
   */
  anchor?: HTMLElement | null;
}

/**
 * @todo make this type conditional to use PortalAnchorProps or PortalAnchorRefProps
 */
type PortalProps = {
  /**
   * String used to designate unique portal
   */
  scope: string;
  /**
   * children to render inside the tooltip
   */
  children: ReactNode;
  /**
   * Used to determine if tooltip is visible, otherwise position will be used.
   */
  visible?: boolean;
  /**
   * Settings to control portal positioning
   */
  settings?: Partial<PopperSettings>;
} & PortalAnchorProps &
  PortalAnchorRefProps;

function getOrCreateNode(id: string, parent: HTMLElement = document.body): HTMLDivElement {
  const node = document.getElementById(id);
  if (node) {
    return node as HTMLDivElement;
  }

  const newNode = document.createElement('div');
  newNode.id = id;
  parent.appendChild(newNode);
  return newNode;
}

const PortalComponent = ({ anchor, anchorRef, position, scope, settings, children, visible }: PortalProps) => {
  /**
   * Used to skip first render for new position, which is used for capture initial position
   */
  const [invisible, setInvisible] = useState(!(visible ?? false));
  /**
   * Anchor element used to position tooltip
   */
  const anchorNode = useRef(isDefined(anchor) ? anchor : getOrCreateNode('echTooltipAnchor', anchorRef ?? undefined));

  if (!isDefined(anchorNode.current)) {
    return null;
  }

  /**
   * This must not be removed from DOM throughout life of this component.
   * Otherwise the portal will loose reference to the correct node.
   */
  const portalNode = useRef(getOrCreateNode(`echPortal${scope}`));

  /**
   * Popper instance used to manage position of tooltip.
   */
  const popper = useRef<Instance | null>(null);

  useEffect(() => {
    popper.current = getPopper(anchorNode.current, portalNode.current);

    return () => {
      if (portalNode.current.parentNode) {
        portalNode.current.parentNode.removeChild(portalNode.current);
      }

      if (popper.current) {
        popper.current.destroy();
      }
    };
  }, []);

  const popperSettings = useMemo(
    () => mergePartial(DEFAULT_POPPER_SETTINGS, settings, { mergeOptionalPartialValues: true }),
    [...(settings && Object.values(settings))],
  );

  const getPopper = useCallback(
    (anchorNode: HTMLElement, portalNode: HTMLElement): Instance => {
      const { fallbackPlacements, placement, boundary, offset } = popperSettings;
      return createPopper(anchorNode, portalNode, {
        strategy: 'fixed',
        placement,
        modifiers: [
          {
            ...popperOffset,
            options: {
              offset: [0, offset],
            },
          },
          {
            ...preventOverflow,
            options: {
              boundary,
            },
          },
          {
            ...popperFlip,
            options: {
              // Note: duplicate values causes lag
              fallbackPlacements: fallbackPlacements.filter((p) => p !== placement),
              boundary,
              // checks main axis overflow before trying to flip
              altAxis: false,
            },
          },
        ],
      });
    },
    [...Object.values(popperSettings)],
  );

  useEffect(() => {
    if (popper.current) {
      popper.current.destroy();
    }

    popper.current = getPopper(anchorNode.current, portalNode.current);
  }, [portalNode.current, ...Object.values(popperSettings)]);

  const updateAnchorDimensions = useCallback(() => {
    if (!position) {
      return;
    }

    const { left, top, width, height } = position!;
    anchorNode.current.style.left = `${left}px`;
    anchorNode.current.style.top = `${top}px`;

    if (isDefined(width)) {
      anchorNode.current.style.width = `${width}px`;
    }

    if (isDefined(height)) {
      anchorNode.current.style.height = `${height}px`;
    }
  }, [anchorNode.current, position?.left, position?.top, position?.width, position?.height]);

  useEffect(() => {
    if (position === null) {
      setInvisible(true);
    } else {
      setInvisible(false);
    }
  }, [position]);

  useEffect(() => {
    updateAnchorDimensions();
    popper.current!.update();
  }, [popper.current, settings, position?.left, position?.top, position?.width, position?.height]);

  return createPortal(<div className={classNames({ invisible })}>{children}</div>, portalNode.current);
};

PortalComponent.displayName = 'Portal';

/** @internal */
export const Portal = PortalComponent;
