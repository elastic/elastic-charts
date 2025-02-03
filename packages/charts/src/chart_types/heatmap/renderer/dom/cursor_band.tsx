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
import { TooltipType } from '../../../../specs/constants';
import { getTooltipType } from '../../../../specs/tooltip';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { getCursorBandPositionSelector } from '../../state/selectors/get_cursor_band';

interface CursorBandProps {
  bandStyle: Theme['crosshair']['band'];
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
    const { bandStyle, cursorPosition, tooltipType, fromExternalEvent } = this.props;
    const isBand = (cursorPosition?.width ?? 0) > 0 && (cursorPosition?.height ?? 0) > 0;
    if (!isBand || !cursorPosition || !canRenderBand(tooltipType, bandStyle.visible, fromExternalEvent)) {
      return null;
    }
    const { x, y, width, height } = cursorPosition;
    const { fill } = bandStyle;
    return (
      <svg className="echCrosshair__cursor" width="100%" height="100%">
        <rect {...{ x, y, width, height, fill, opacity: 0.5 }} />
      </svg>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): CursorBandProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      bandStyle: LIGHT_THEME.crosshair.band,
      tooltipType: TooltipType.None,
    };
  }
  const settings = getSettingsSpecSelector(state);
  const tooltip = getTooltipSpecSelector(state);
  const cursorBandPosition = getCursorBandPositionSelector(state);
  const fromExternalEvent = cursorBandPosition?.fromExternalEvent;
  const tooltipType = getTooltipType(tooltip, settings, fromExternalEvent);

  return {
    bandStyle: getChartThemeSelector(state).crosshair.band,
    cursorPosition: cursorBandPosition,
    tooltipType,
    fromExternalEvent,
  };
};

/** @internal */
export const CursorBand = connect(mapStateToProps)(CursorBandComponent);
