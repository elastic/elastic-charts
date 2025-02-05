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
import { TooltipType, getTooltipType } from '../../../../specs';
import { GlobalChartState } from '../../../../state/chart_state';
import { TooltipInteractionState } from '../../../../state/interactions_state';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getTooltipInteractionState } from '../../../../state/selectors/get_tooltip_interaction_state';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';
import { isBrushingSelector } from '../../../../state/selectors/is_brushing';
import { getInitialTooltipState } from '../../../../state/utils/get_initial_tooltip_state';
import { Rotation } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { getCursorBandPositionSelector } from '../../state/selectors/get_cursor_band';

interface CursorBandProps {
  theme: Theme;
  isBrushing: boolean;
  chartRotation: Rotation;
  cursorPosition?: Rect;
  tooltipType: TooltipType;
  fromExternalEvent?: boolean;
  tooltipState: TooltipInteractionState;
}

function canRenderBand(type: TooltipType, pinned: boolean, visible: boolean, fromExternalEvent?: boolean) {
  return (
    pinned || (visible && (type === TooltipType.Crosshairs || type === TooltipType.VerticalCursor || fromExternalEvent))
  );
}

class CursorBandComponent extends React.Component<CursorBandProps> {
  static displayName = 'CursorBand';

  render() {
    const {
      theme: {
        crosshair: { band },
      },
      isBrushing,
      cursorPosition,
      tooltipType,
      fromExternalEvent,
      tooltipState: { pinned },
    } = this.props;
    const isBand = (cursorPosition?.width ?? 0) > 0 && (cursorPosition?.height ?? 0) > 0;
    if (
      isBrushing ||
      !isBand ||
      !cursorPosition ||
      !canRenderBand(tooltipType, pinned, band.visible, fromExternalEvent)
    ) {
      return null;
    }
    const { x, y, width, height } = cursorPosition;
    const { fill } = band;
    return (
      <svg className="echCrosshair__cursor" width="100%" height="100%">
        <rect {...{ x, y, width, height, fill }} />
      </svg>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): CursorBandProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      isBrushing: false,
      theme: LIGHT_THEME,
      chartRotation: 0,
      tooltipType: TooltipType.None,
      tooltipState: getInitialTooltipState(),
    };
  }
  const settings = getSettingsSpecSelector(state);
  const tooltip = getTooltipSpecSelector(state);
  const cursorBandPosition = getCursorBandPositionSelector(state);
  const fromExternalEvent = cursorBandPosition?.fromExternalEvent;
  const tooltipType = getTooltipType(tooltip, settings, fromExternalEvent);

  return {
    isBrushing: isBrushingSelector(state),
    theme: getChartThemeSelector(state),
    chartRotation: getChartRotationSelector(state),
    cursorPosition: cursorBandPosition,
    tooltipType,
    fromExternalEvent,
    tooltipState: getTooltipInteractionState(state),
  };
};

/** @internal */
export const CursorBand = connect(mapStateToProps)(CursorBandComponent);
