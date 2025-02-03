/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';

import { Line } from '../../../../geoms/types';
import { TooltipType } from '../../../../specs/constants';
import { getTooltipType } from '../../../../specs/tooltip';
import { GlobalChartState } from '../../../../state/global_chart_state';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';
import { Rotation } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme } from '../../../../utils/themes/theme';
import { getCursorBandPositionSelector } from '../../state/selectors/get_cursor_band';
import { getCursorLinePositionSelector } from '../../state/selectors/get_cursor_line';

interface CursorCrossLineProps {
  theme: Theme;
  chartRotation: Rotation;
  cursorCrossLinePosition?: Line;
  tooltipType: TooltipType;
}

function canRenderHelpLine(type: TooltipType, visible: boolean) {
  return visible && type === TooltipType.Crosshairs;
}

class CursorCrossLineComponent extends React.Component<CursorCrossLineProps> {
  static displayName = 'CursorCrossLine';

  render() {
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
}

const mapStateToProps = (state: GlobalChartState): CursorCrossLineProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      theme: LIGHT_THEME,
      chartRotation: 0,
      tooltipType: TooltipType.None,
    };
  }
  const settings = getSettingsSpecSelector(state);
  const tooltip = getTooltipSpecSelector(state);
  const cursorBandPosition = getCursorBandPositionSelector(state);
  const fromExternalEvent = cursorBandPosition?.fromExternalEvent;
  const tooltipType = getTooltipType(tooltip, settings, fromExternalEvent);

  return {
    theme: getChartThemeSelector(state),
    chartRotation: getChartRotationSelector(state),
    cursorCrossLinePosition: getCursorLinePositionSelector(state),
    tooltipType,
  };
};

/** @internal */
export const CursorCrossLine = connect(mapStateToProps)(CursorCrossLineComponent);
