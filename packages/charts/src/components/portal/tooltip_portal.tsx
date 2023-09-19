/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createPopper, Instance, Placement as PopperPlacement } from '@popperjs/core';
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { PortalAnchorRef, PositionedPortalAnchorRef, TooltipPortalSettings } from './types';
import { DEFAULT_POPPER_SETTINGS, getOrCreateNode, isHTMLElement } from './utils';
import { isDefined, mergePartial } from '../../utils/common';
import { Padding } from '../../utils/dimensions';

/**
 * @todo make this type conditional to use PortalAnchorProps or PortalAnchorRefProps
 */
type PortalTooltipProps = {
  zIndex: number;
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
  settings?: TooltipPortalSettings;
  /**
   * Anchor element to use as position reference
   */
  anchor: PortalAnchorRef | PositionedPortalAnchorRef;
  /**
   * Chart Id to add new anchor for each chart on the page
   */
  chartId: string;

  /**
   * Called when computed placement changes
   */
  onPlacementChange?: (placement: PopperPlacement) => void;
};

function addToPadding(padding: Partial<Padding> | number = 0, extra: number = 0): Padding | number | undefined {
  if (typeof padding === 'number') return padding + extra;

  const { top = 0, right = 0, bottom = 0, left = 0 } = padding;

  return {
    top: top + extra,
    right: right + extra,
    bottom: bottom + extra,
    left: left + extra,
  };
}

const TooltipPortalComponent = ({
  anchor,
  scope,
  settings,
  children,
  visible,
  chartId,
  zIndex,
  onPlacementChange,
}: PortalTooltipProps) => {
  const finalPlacement = useRef<PopperPlacement>('auto');
  const skipPositioning = isHTMLElement((anchor as PortalAnchorRef).current);
  const { position } = anchor as PositionedPortalAnchorRef;

  /**
   * Anchor element used to position tooltip
   */
  const anchorNode = useMemo(() => {
    return (
      (anchor as PortalAnchorRef)?.current ??
      getOrCreateNode(
        `echAnchor${scope}__${chartId}`,
        undefined,
        (anchor as PositionedPortalAnchorRef)?.appendRef?.current,
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(anchor as PortalAnchorRef)?.current ?? (anchor as PositionedPortalAnchorRef)?.appendRef?.current]);

  const portalNode = useMemo(() => {
    return getOrCreateNode(`echTooltipPortal${scope}__${chartId}`, 'echTooltipPortal__invisible', undefined, zIndex);
  }, [chartId, scope, zIndex]);

  /**
   * This must not be removed from DOM throughout life of this component.
   * Otherwise the portal will loose reference to the correct node.
   */
  useEffect(() => {
    document.body.appendChild(portalNode);
  });

  /**
   * Popper instance used to manage position of tooltip.
   */
  const popper = useRef<Instance | null>(null);
  const popperSettings = useMemo(
    // @ts-ignore - nesting limitation
    () => mergePartial(DEFAULT_POPPER_SETTINGS, settings),
    [settings],
  );
  const destroyPopper = useCallback(() => {
    if (popper.current) {
      popper.current.destroy();
      popper.current = null;
    }
  }, []);

  const setPopper = useCallback(() => {
    if (!visible) return;

    const { fallbackPlacements, placement, boundary, offset, boundaryPadding } = popperSettings;
    popper.current = createPopper(anchorNode, portalNode, {
      strategy: 'absolute',
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
            padding: boundaryPadding,
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
            padding: addToPadding(boundaryPadding, offset),
          },
        },
        {
          name: 'reportPlacement',
          phase: 'afterWrite',
          enabled: Boolean(onPlacementChange),
          fn: ({ state }) => {
            if (finalPlacement.current !== state.placement) {
              finalPlacement.current = state.placement;
              onPlacementChange?.(state.placement);
            }
          },
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visible,
    popperSettings.fallbackPlacements,
    popperSettings.placement,
    popperSettings.boundary,
    popperSettings.offset,
  ]);

  useEffect(() => {
    setPopper();
    const nodeCopy = portalNode;

    return () => {
      if (nodeCopy.parentNode) {
        nodeCopy.parentNode.removeChild(nodeCopy);
      }

      destroyPopper();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    destroyPopper();
    setPopper();
  }, [destroyPopper, setPopper, popperSettings]);

  useEffect(() => {
    if (!visible) {
      destroyPopper();
    } else if (!popper.current) {
      setPopper();
    }
  }, [destroyPopper, setPopper, visible]);

  const updateAnchorDimensions = useCallback(() => {
    if (!position || !visible || skipPositioning) {
      return;
    }

    const { x, y, width, height } = position;
    anchorNode.style.transform = `translate(${x}px, ${y}px)`;

    if (isDefined(width)) {
      anchorNode.style.width = `${width}px`;
    }

    if (isDefined(height)) {
      anchorNode.style.height = `${height}px`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, anchorNode, position?.x, position?.y, position?.width, position?.height]);

  useEffect(() => {
    if (!position && !skipPositioning) {
      portalNode.classList.add('echTooltipPortal__invisible');
      return;
    }
    portalNode.classList.remove('echTooltipPortal__invisible');
  }, [portalNode.classList, position, skipPositioning]);

  useEffect(() => {
    if (popper.current) {
      updateAnchorDimensions();
      void popper.current.update();
    }
  }, [updateAnchorDimensions]);

  return createPortal(children, portalNode, 'ech-tooltip-portal');
};

TooltipPortalComponent.displayName = 'TooltipPortal';

/** @internal */
export const TooltipPortal = TooltipPortalComponent;
