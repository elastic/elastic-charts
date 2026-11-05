/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';

import { isVerticalRotation } from '../../chart_types/xy_chart/state/utils/common';
import { colorToRgba, overrideOpacity } from '../../common/color_library_wrappers';
import { Colors } from '../../common/colors';
import { withClip } from '../../renderers/canvas';
import { renderRectStroke, renderRect } from '../../renderers/canvas/primitives/rect';
import type { StrokedSides } from '../../renderers/canvas/primitives/rect';
import type { Painter } from '../../renderers/painter';
import { BrushAxis } from '../../specs/brush_axis';
import { DEFAULT_SETTINGS_SPEC } from '../../specs/default_settings_spec';
import type { GlobalChartState } from '../../state/chart_state';
import type { StageElement } from '../../state/internal_chart_renderer';
import { getChartRotationSelector } from '../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../../state/selectors/get_device_pixel_ratio';
import { getInternalChartStateSelector } from '../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import type { Rotation } from '../../utils/common';
import type { Dimensions } from '../../utils/dimensions';
import { LIGHT_THEME } from '../../utils/themes/light_theme';
import type { BrushStyle } from '../../utils/themes/theme';
import { Stage } from '../stage';

interface StateProps {
  devicePixelRatio: number;
  initialized: boolean;
  mainProjectionArea: Dimensions;
  projectionContainer: Dimensions;
  isBrushing: boolean | undefined;
  isBrushAvailable: boolean | undefined;
  brushEvent: Dimensions | null;
  zIndex: number;
  style: BrushStyle;
  brushAxis?: BrushAxis;
  chartRotation: Rotation;
}

const BRUSH_STROKED_SIDES = Object.freeze({
  TOP_BOTTOM: { top: true, bottom: true, left: false, right: false } as const,
  LEFT_RIGHT: { left: true, right: true, top: false, bottom: false } as const,
  ALL: { top: true, right: true, bottom: true, left: true } as const,
});

class BrushToolComponent extends React.Component<StateProps> {
  static displayName = 'BrushTool';

  private readonly stageRef: RefObject<StageElement> = React.createRef();

  private paint = (painter: Painter) => {
    const { brushEvent, mainProjectionArea, style, brushAxis, chartRotation } = this.props;
    painter.clear(Colors.Transparent.keyword);
    if (!brushEvent) {
      return;
    }
    const strokedSides = getBrushStrokedSides(chartRotation, brushAxis);
    const { top, left, width, height } = brushEvent;
    withClip(
      painter,
      {
        x: mainProjectionArea.left,
        y: mainProjectionArea.top,
        width: mainProjectionArea.width,
        height: mainProjectionArea.height,
      },
      () => {
        painter.translate(mainProjectionArea.left, mainProjectionArea.top);
        renderRect(
          painter,
          { x: left, y: top, width, height },
          { color: overrideOpacity(colorToRgba(style.fill), style.opacity) },
          { width: 0, color: Colors.Transparent.rgba },
        );
        renderRectStroke(
          painter,
          { x: left, y: top, width, height },
          {
            width: style.strokeWidth,
            color: colorToRgba(style.stroke),
          },
          strokedSides,
        );
      },
    );
  };

  render() {
    const { initialized, isBrushAvailable, isBrushing, projectionContainer, zIndex, devicePixelRatio } = this.props;
    if (!initialized || !isBrushAvailable || !isBrushing) {
      return null;
    }
    const { width, height } = projectionContainer;
    return (
      <Stage
        width={width}
        height={height}
        devicePixelRatio={devicePixelRatio}
        forwardStageRef={this.stageRef}
        className="echBrushTool"
        style={{ zIndex }}
        paint={this.paint}
      />
    );
  }
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (internalChartState === null || getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return {
      devicePixelRatio: 1,
      initialized: false,
      projectionContainer: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      },
      mainProjectionArea: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      isBrushing: false,
      isBrushAvailable: false,
      brushEvent: null,
      zIndex: 0,
      style: LIGHT_THEME.brush,
      brushAxis: DEFAULT_SETTINGS_SPEC.brushAxis,
      chartRotation: DEFAULT_SETTINGS_SPEC.rotation,
    };
  }

  return {
    devicePixelRatio: getDevicePixelRatioSelector(state),
    initialized: state.specsInitialized,
    projectionContainer: internalChartState.getProjectionContainerArea(state),
    mainProjectionArea: internalChartState.getMainProjectionArea(state),
    isBrushAvailable: internalChartState.isBrushAvailable(state),
    isBrushing: internalChartState.isBrushing(state),
    brushEvent: internalChartState.getBrushArea(state),
    zIndex: state.zIndex,
    style: getChartThemeSelector(state).brush,
    brushAxis: getSettingsSpecSelector(state).brushAxis,
    chartRotation: getChartRotationSelector(state),
  };
};

function getBrushStrokedSides(rotation: Rotation, brushAxis?: BrushAxis): StrokedSides {
  const vertical = isVerticalRotation(rotation);
  switch (brushAxis) {
    case BrushAxis.X:
      return vertical ? BRUSH_STROKED_SIDES.TOP_BOTTOM : BRUSH_STROKED_SIDES.LEFT_RIGHT;
    case BrushAxis.Y:
      return vertical ? BRUSH_STROKED_SIDES.LEFT_RIGHT : BRUSH_STROKED_SIDES.TOP_BOTTOM;
    case BrushAxis.Both:
    default:
      return BRUSH_STROKED_SIDES.ALL;
  }
}

/** @internal */
export const BrushTool = connect(mapStateToProps)(BrushToolComponent);
