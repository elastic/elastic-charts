/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { Rect } from '../../../../geoms/types';
import { getTooltipType } from '../../../../specs';
import { TooltipType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';
import { Rotation } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { getCursorBandPositionSelector } from '../../state/selectors/get_cursor_band';

interface CursorLineProps {
  theme: Theme;
  chartRotation: Rotation;
  cursorPosition?: Rect;
  tooltipType: TooltipType;
  fromExternalEvent?: boolean;
  isLine: boolean;
}

function canRenderBand(type: TooltipType, visible: boolean, fromExternalEvent?: boolean) {
  return visible && (type === TooltipType.Crosshairs || type === TooltipType.VerticalCursor || fromExternalEvent);
}

class CursorLineComponent extends React.Component<CursorLineProps> {
  static displayName = 'CursorLine';

  render() {
    const {
      theme: {
        crosshair: { band, line },
      },
      cursorPosition,
      tooltipType,
      fromExternalEvent,
      isLine,
    } = this.props;

    if (!cursorPosition || !canRenderBand(tooltipType, band.visible, fromExternalEvent) || !isLine) {
      return null;
    }
    const { x, y, width, height } = cursorPosition;
    const { strokeWidth, stroke, dash } = line;
    const strokeDasharray = (dash ?? []).join(' ');
    return (
      <svg className="echCrosshair__cursor" width="100%" height="100%">
        <line {...{ x1: x, x2: x + width, y1: y, y2: y + height, strokeWidth, stroke, strokeDasharray }} />
      </svg>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): CursorLineProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      theme: LIGHT_THEME,
      chartRotation: 0,
      tooltipType: TooltipType.None,
      isLine: false,
    };
  }
  const settings = getSettingsSpecSelector(state);
  const tooltip = getTooltipSpecSelector(state);
  const cursorBandPosition = getCursorBandPositionSelector(state);
  const fromExternalEvent = cursorBandPosition?.fromExternalEvent;
  const tooltipType = getTooltipType(tooltip, settings, fromExternalEvent);
  const isLine = cursorBandPosition?.width === 0 || cursorBandPosition?.height === 0;

  return {
    theme: getChartThemeSelector(state),
    chartRotation: getChartRotationSelector(state),
    cursorPosition: cursorBandPosition,
    tooltipType,
    fromExternalEvent,
    isLine,
  };
};

/** @internal */
export const CursorLine = connect(mapStateToProps)(CursorLineComponent);
