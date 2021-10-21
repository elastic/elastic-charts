/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { Line, Rect } from '../../../../geoms/types';
import { getTooltipType } from '../../../../specs';
import { TooltipType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Rotation } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { getCursorBandPositionSelector } from '../../state/selectors/get_cursor_band';
import { getCursorLinePositionSelector } from '../../state/selectors/get_cursor_line';

interface CrosshairProps {
  theme: Theme;
  chartRotation: Rotation;
  cursorPosition?: Rect;
  cursorCrossLinePosition?: Line;
  tooltipType: TooltipType;
  fromExternalEvent?: boolean;
}

function canRenderBand(type: TooltipType, visible: boolean, fromExternalEvent?: boolean) {
  return visible && (type === TooltipType.Crosshairs || type === TooltipType.VerticalCursor || fromExternalEvent);
}

function canRenderHelpLine(type: TooltipType, visible: boolean) {
  return visible && type === TooltipType.Crosshairs;
}

class CrosshairComponent extends React.Component<CrosshairProps> {
  static displayName = 'Crosshair';

  renderCursor() {
    const {
      theme: {
        crosshair: { band, line },
      },
      cursorPosition,
      tooltipType,
      fromExternalEvent,
    } = this.props;

    if (!cursorPosition || !canRenderBand(tooltipType, band.visible, fromExternalEvent)) {
      return null;
    }
    const { x, y, width, height } = cursorPosition;
    const isLine = width === 0 || height === 0;
    const { strokeWidth, stroke, dash } = line;
    const { fill } = band;
    const strokeDasharray = (dash ?? []).join(' ');
    return (
      <svg className="echCrosshair__cursor" width="100%" height="100%">
        {isLine && <line {...{ x1: x, x2: x + width, y1: y, y2: y + height, strokeWidth, stroke, strokeDasharray }} />}
        {!isLine && <rect {...{ x, y, width, height, fill }} />}
      </svg>
    );
  }

  renderCrossLine() {
    const {
      theme: {
        crosshair: { crossLine },
      },
      cursorCrossLinePosition,
      tooltipType,
    } = this.props;

    if (!cursorCrossLinePosition || !canRenderHelpLine(tooltipType, crossLine.visible)) {
      return null;
    }

    const { strokeWidth, stroke, dash } = crossLine;
    const style = {
      strokeWidth,
      stroke,
      strokeDasharray: (dash ?? []).join(' '),
    };

    return (
      <svg className="echCrosshair__crossLine" width="100%" height="100%">
        <line {...cursorCrossLinePosition} {...style} />
      </svg>
    );
  }

  render() {
    return (
      <>
        {this.renderCursor()}
        {this.renderCrossLine()}
      </>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): CrosshairProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      theme: LIGHT_THEME,
      chartRotation: 0,
      tooltipType: TooltipType.None,
    };
  }
  const settings = getSettingsSpecSelector(state);
  const cursorBandPosition = getCursorBandPositionSelector(state);
  const fromExternalEvent = cursorBandPosition?.fromExternalEvent;
  const tooltipType = getTooltipType(settings, fromExternalEvent);

  return {
    theme: getChartThemeSelector(state),
    chartRotation: getChartRotationSelector(state),
    cursorPosition: cursorBandPosition,
    cursorCrossLinePosition: getCursorLinePositionSelector(state),
    tooltipType,
    fromExternalEvent,
  };
};

/** @internal */
export const Crosshair = connect(mapStateToProps)(CrosshairComponent);
