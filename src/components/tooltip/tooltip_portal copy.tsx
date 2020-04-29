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

import React, { RefObject, createRef, Component } from 'react';
import { createPortal } from 'react-dom';
import { connect } from 'react-redux';
import { createPopper, Instance } from '@popperjs/core/lib/popper-lite.js';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import popperOffset from '@popperjs/core/lib/modifiers/offset.js';
import popperFlip from '@popperjs/core/lib/modifiers/flip.js';

import { TooltipAnchorPosition } from './types';
import { TooltipInfo } from './types';
import { TooltipValueFormatter, TooltipSettings, TooltipType } from '../../specs';
import { GlobalChartState, BackwardRef } from '../../state/chart_state';
import { isInitialized } from '../../state/selectors/is_initialized';
import { getInternalIsTooltipVisibleSelector } from '../../state/selectors/get_internal_is_tooltip_visible';
import { getTooltipHeaderFormatterSelector } from '../../state/selectors/get_tooltip_header_formatter';
import { getInternalTooltipInfoSelector } from '../../state/selectors/get_internal_tooltip_info';
import { getInternalTooltipAnchorPositionSelector } from '../../state/selectors/get_internal_tooltip_anchor_position';
import { Tooltip } from './tooltip';
import { HIGHLIGHT_PATH_SELECTOR } from '../../chart_types/xy_chart/state/selectors/get_tooltip_values_highlighted_geoms';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_specs';
import { Position } from '../../utils/commons';
import { getTooltipTypeSelector } from '../../chart_types/xy_chart/state/selectors/get_tooltip_type';
import { deepEqual } from '../../utils/fast_deep_equal';

interface PopperSettings {
  fallbackPlacements: Position[];
  placement: Position;
  boundary?: HTMLElement;
}

interface TooltipPortalStateProps {
  isVisible: boolean;
  position: TooltipAnchorPosition | null;
  info?: TooltipInfo;
  headerFormatter?: TooltipValueFormatter;
  settings: TooltipSettings;
  type: TooltipType;
}
interface TooltipPortalOwnProps {
  getChartContainerRef: BackwardRef;
}

type TooltipPortalProps = TooltipPortalStateProps & TooltipPortalOwnProps;

class TooltipPortalComponent extends Component<TooltipPortalProps> {
  static displayName = 'Tooltip';
  private popper: Instance | null = null;
  portalNode: HTMLDivElement | null = null;
  /**
   * Invisible Anchor element used to position tooltip
   */
  anchorNode: HTMLDivElement | null = null;
  hlNode: SVGElement | null = null;
  tooltipRef: RefObject<HTMLDivElement>;

  constructor(props: TooltipPortalProps) {
    super(props);
    this.tooltipRef = createRef();
  }

  createPortalNode() {
    const container = document.getElementById('echTooltipContainerPortal');
    if (container) {
      this.portalNode = container as HTMLDivElement;
    } else {
      this.portalNode = document.createElement('div');
      this.portalNode.id = 'echTooltipContainerPortal';
      document.body.appendChild(this.portalNode);
    }
  }

  createAnchorNode(chartContainer: HTMLDivElement) {
    const container = document.getElementById('echTooltipAnchor');
    if (container) {
      this.anchorNode = container as HTMLDivElement;
    } else {
      this.anchorNode = document.createElement('div');
      this.anchorNode.id = 'echTooltipAnchor';
      chartContainer.appendChild(this.anchorNode);
    }
  }

  getHighlighter(): SVGGElement | null {
    return document.getElementById(HIGHLIGHT_PATH_SELECTOR) as SVGGElement | null;
  }

  componentDidMount() {
    this.createPortalNode();
  }

  shouldComponentUpdate(nextProps: TooltipPortalProps) {
    return !deepEqual(this.props, nextProps);
  }

  componentDidUpdate() {
    this.renderPopper();
  }

  componentWillUnmount() {
    if (this.portalNode && this.portalNode.parentNode) {
      this.portalNode.parentNode.removeChild(this.portalNode);
    }

    if (this.popper) {
      this.popper.destroy();
    }
  }

  getPopperSettings(chartNode: HTMLDivElement): PopperSettings {
    const fallbackPlacements = [Position.Right, Position.Left, Position.Top, Position.Bottom];
    const placement = Position.Right;
    if (typeof this.props.settings === 'string') {
      return {
        fallbackPlacements,
        placement,
      };
    }
    const { settings } = this.props;

    return {
      fallbackPlacements: settings?.fallbackPlacements ?? fallbackPlacements,
      placement: settings?.placement ?? placement,
      boundary: settings?.boundary === 'chart' ? chartNode : settings?.boundary,
    };
  }

  private updateAnchorDimensions(anchor: HTMLDivElement, { x0, x1, y0, y1 }: TooltipAnchorPosition) {
    const width = x0 !== undefined ? x1 - x0 : 0;
    const height = y0 !== undefined ? y1 - y0 : 0;
    anchor.style.left = `${x1 - width}px`;
    anchor.style.width = `${width}px`;
    anchor.style.top = `${y1 - height}px`;
    anchor.style.height = `${height}px`;
  }

  renderPopper() {
    const { getChartContainerRef, position } = this.props;
    this.createPortalNode();
    const chartContainerRef = getChartContainerRef();

    if (chartContainerRef.current) {
      this.createAnchorNode(chartContainerRef.current);
    }

    if (!chartContainerRef.current || !this.portalNode || !this.anchorNode || !position) {
      return;
    }

    this.updateAnchorDimensions(this.anchorNode, position);

    if (!this.popper) {
      const { fallbackPlacements, placement, boundary } = this.getPopperSettings(chartContainerRef.current);
      this.popper = createPopper(this.anchorNode, this.portalNode, {
        strategy: 'fixed',
        placement,
        modifiers: [
          {
            ...popperOffset,
            options: {
              offset: [0, 10],
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
    }

    this.popper!.update();
  }

  render() {
    const { isVisible, info, getChartContainerRef } = this.props;
    const chartContainerRef = getChartContainerRef();

    if (!this.portalNode || chartContainerRef.current === null || !isVisible || !info) {
      return null;
    }

    return createPortal(<Tooltip info={info} headerFormatter={this.props.headerFormatter} />, this.portalNode);
  }
}

const HIDDEN_TOOLTIP_PROPS = {
  isVisible: false,
  info: undefined,
  position: null,
  headerFormatter: undefined,
  settings: {},
  type: TooltipType.VerticalCursor,
};

const mapStateToProps = (state: GlobalChartState): TooltipPortalStateProps => {
  if (!isInitialized(state)) {
    return HIDDEN_TOOLTIP_PROPS;
  }
  return {
    isVisible: getInternalIsTooltipVisibleSelector(state),
    info: getInternalTooltipInfoSelector(state),
    position: getInternalTooltipAnchorPositionSelector(state),
    headerFormatter: getTooltipHeaderFormatterSelector(state),
    settings: getSettingsSpecSelector(state).tooltip,
    type: getTooltipTypeSelector(state),
  };
};

/** @internal */
export const TooltipPortal = connect(mapStateToProps)(TooltipPortalComponent);
