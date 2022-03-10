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
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Rotation } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { getCursorBandPositionSelector } from '../../state/selectors/get_cursor_band';

interface CursorBandProps {
  theme: Theme;
  chartRotation: Rotation;
  cursorPosition?: Rect;
  tooltipType: TooltipType;
  fromExternalEvent?: boolean;
}

function canRenderBand(type: TooltipType, visible: boolean, fromExternalEvent?: boolean) {
  return visible && (type === TooltipType.Crosshairs || type === TooltipType.VerticalCursor || fromExternalEvent);
}

class CursorBandComponent extends React.Component<CursorBandProps> {
  static displayName = 'CursorBand';

  render() {
    const {
      theme: {
        crosshair: { band },
      },
      cursorPosition,
      tooltipType,
      fromExternalEvent,
    } = this.props;
    const isBand = (cursorPosition?.width ?? 0) > 0 && (cursorPosition?.height ?? 0) > 0;
    if (!isBand || !cursorPosition || !canRenderBand(tooltipType, band.visible, fromExternalEvent)) {
      return null;
    }
    const { x, y, width, height } = cursorPosition;
    const { fill } = band;
    return (
      <svg className="echCrosshair__cursor" width="100%" height="100%">
        {/* FIXME this is an example of expanding the vertical cursor band to cover the X axis */}
        <rect {...{ x, y, width, height: height + 35, fill }} />
      </svg>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): CursorBandProps => {
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
    tooltipType,
    fromExternalEvent,
  };
};

/** @internal */
export const CursorBand = connect(mapStateToProps)(CursorBandComponent);
