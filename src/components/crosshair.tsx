import { inject, observer } from 'mobx-react';
import React, { CSSProperties } from 'react';
import { Rotation } from '../lib/series/specs';
import { isCrosshairTooltipType, TooltipType } from '../lib/utils/interactions';
import { ChartStore } from '../state/chart_state';

interface CrosshairProps {
  chartStore?: ChartStore;
}

function canRenderVertical(type: TooltipType, chartRotation: Rotation, visible: boolean) {
  if (visible && type === TooltipType.Crosshairs) {
    return true;
  }
  return (
    visible && type === TooltipType.VerticalCursor && (chartRotation === 0 || chartRotation === 180)
  );
}
function canRenderHorizontal(type: TooltipType, visible: boolean) {
  return visible && type === TooltipType.Crosshairs;
}

class CrosshairComponent extends React.Component<CrosshairProps> {
  static displayName = 'Crosshair';

  render() {
    const {
      cursorPosition,
      chartRotation,
      tooltipType,
      chartTheme: { crosshair },
    } = this.props.chartStore!;
    if (
      !isCrosshairTooltipType(tooltipType.get()) ||
      cursorPosition.x === -1 ||
      cursorPosition.y === -1
    ) {
      return <div className="elasticChartsCrosshair" />;
    }

    return (
      <div className="elasticChartsCrosshair">
        {canRenderVertical(tooltipType.get(), chartRotation, crosshair.vertical.visible) &&
          this.renderVertical()}
        {canRenderHorizontal(tooltipType.get(), crosshair.horizontal.visible) &&
          this.renderHorizontal()}
      </div>
    );
  }
  renderVertical() {
    const {
      // cursorPosition,
      chartDimensions,
      chartRotation,
      cursorBandPosition,
      chartTheme: { crosshair },
    } = this.props.chartStore!;
    const crossHairStyle = [180, 0].includes(chartRotation)
      ? crosshair.vertical
      : crosshair.horizontal;
    const left = cursorBandPosition.x + chartDimensions.left;
    const { top, height } = chartDimensions;

    const style: CSSProperties = {
      left,
      top,
      height,
      width: cursorBandPosition.width,
      opacity: crossHairStyle.opacity,
    };
    return <div className="elasticChartsCrosshair__verticalBand" style={style} />;
  }
  renderHorizontal() {
    const {
      cursorPosition,
      chartDimensions,
      chartRotation,
      chartTheme: { crosshair },
    } = this.props.chartStore!;
    const left = chartDimensions.left;
    const crossHairStyle = [180, 0].includes(chartRotation)
      ? crosshair.horizontal
      : crosshair.vertical;
    const top = cursorPosition.y + chartDimensions.top;
    const { width } = chartDimensions;
    const style: CSSProperties = {
      left,
      width,
      top,
      height: 0,
      borderTopWidth: crossHairStyle.strokeWidth,
      borderTopColor: crossHairStyle.stroke,
      borderTopStyle: crossHairStyle.dash ? 'dashed' : 'solid',
      background: 'transparent',
      zIndex: 190,
      opacity: crossHairStyle.opacity,
    };
    return <div className="elasticChartsCrosshair__horizontalLine" style={style} />;
  }
}

export const Crosshair = inject('chartStore')(observer(CrosshairComponent));
