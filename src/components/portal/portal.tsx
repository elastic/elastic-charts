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
import { createPopper, Instance } from '@popperjs/core';

import { mergePartial } from '../../utils/commons';
import { isDefined } from '../../chart_types/xy_chart/state/utils';
import { PopperSettings, PortalAnchorRef } from './types';
import { DEFAULT_POPPER_SETTINGS, getOrCreateNode, isHTMLElement } from './utils';

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
   * Used to determine if tooltip is visible
   */
  visible: boolean;
  /**
   * Settings to control portal positioning
   */
  settings?: Partial<PopperSettings>;
  /**
   * Anchor element to use as position reference
   */
  anchor: HTMLElement | PortalAnchorRef | null;
  /**
   * Chart Id to add new anchor for each chart on the page
   */
  chartId: string;
};

const PortalComponent = ({ anchor, scope, settings, children, visible, chartId }: PortalProps) => {
  /**
   * Used to skip first render for new position, which is used for capture initial position
   */
  const [invisible, setInvisible] = useState(!(visible ?? false));
  /**
   * Anchor element used to position tooltip
   */
  const anchorNode = useRef(
    isHTMLElement(anchor) ? anchor : getOrCreateNode(`echAnchor${scope}__${chartId}`, anchor?.ref ?? undefined),
  );

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

  const popperSettings = useMemo(
    () => mergePartial(DEFAULT_POPPER_SETTINGS, settings, { mergeOptionalPartialValues: true }),
    [settings, settings],
  );

  const position = useMemo(() => (isHTMLElement(anchor) ? null : anchor?.position), [
    anchor,
    (anchor as PortalAnchorRef)?.position,
  ]);

  const destroyPopper = useCallback(() => {
    if (popper.current) {
      popper.current.destroy();
      popper.current = null;
    }
  }, [popper.current]);

  const setPopper = useCallback((): Instance => {
    if (!visible) {
      return;
    }

    const { fallbackPlacements, placement, boundary, offset } = popperSettings;
    popper.current = createPopper(anchorNode.current, portalNode.current, {
      strategy: 'fixed',
      placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, offset],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary,
          },
        },
        {
          name: 'flip',
          options: {
            // Note: duplicate values causes lag
            fallbackPlacements: fallbackPlacements.filter((p) => p !== placement),
            boundary,
            // checks main axis overflow before trying to flip
            altAxis: false,
            padding: offset || 10,
          },
        },
      ],
    });
  }, [
    visible,
    popperSettings.fallbackPlacements,
    popperSettings.placement,
    popperSettings.boundary,
    popperSettings.offset,
  ]);

  useEffect(() => {
    setPopper();

    return () => {
      if (portalNode.current.parentNode) {
        portalNode.current.parentNode.removeChild(portalNode.current);
      }

      destroyPopper();
    };
  }, []);

  useEffect(() => {
    destroyPopper();
    setPopper();
  }, [
    portalNode.current,
    popperSettings.fallbackPlacements,
    popperSettings.placement,
    popperSettings.boundary,
    popperSettings.offset,
  ]);

  useEffect(() => {
    if (!visible) {
      destroyPopper();
    } else if (!popper.current) {
      setPopper();
    }
  }, [visible]);

  const updateAnchorDimensions = useCallback(() => {
    if (!position || !visible) {
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
  }, [visible, anchorNode.current, position?.left, position?.top, position?.width, position?.height]);

  useEffect(() => {
    if (position === null) {
      setInvisible(true);
    } else {
      setInvisible(false);
    }
  }, [position]);

  useEffect(() => {
    if (popper.current) {
      updateAnchorDimensions();
      popper.current.update();
    }
  }, [popper.current, settings, position?.left, position?.top, position?.width, position?.height]);

  return createPortal(<div className={classNames({ invisible })}>{children}</div>, portalNode.current);
};

PortalComponent.displayName = 'Portal';

/** @internal */
export const Portal = PortalComponent;
