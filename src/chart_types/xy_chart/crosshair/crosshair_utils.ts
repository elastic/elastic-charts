import { Rotation } from '../utils/specs';
import { Dimensions } from '../../../utils/dimensions';
import { Scale } from '../../../utils/scales/scales';
import { isHorizontalRotation } from '../store/utils';
import { Point } from '../store/chart_state';

export interface SnappedPosition {
  position: number;
  band: number;
}
export interface TooltipPosition {
  vPosition: {
    isHorizontalRotated: boolean;
    bandHeight: number;
    bandTop: number;
  };
  hPosition: {
    isHorizontalRotated: boolean;
    bandLeft: number;
    bandWidth: number;
  };
}

export const DEFAULT_SNAP_POSITION_BAND = 1;

export function getSnapPosition(
  value: string | number,
  scale: Scale,
  totalBarsInCluster = 1,
): { band: number; position: number } | undefined {
  const position = scale.scale(value);
  if (position === undefined) {
    return;
  }

  if (scale.bandwidth > 0) {
    const band = scale.bandwidth / (1 - scale.barsPadding);

    const halfPadding = (band - scale.bandwidth) / 2;
    return {
      position: position - halfPadding * totalBarsInCluster,
      band: band * totalBarsInCluster,
    };
  } else {
    return {
      position,
      band: DEFAULT_SNAP_POSITION_BAND,
    };
  }
}

export function getCursorLinePosition(
  chartRotation: Rotation,
  chartDimensions: Dimensions,
  cursorPosition: { x: number; y: number },
): Dimensions {
  const { left, top, width, height } = chartDimensions;
  const isHorizontalRotated = isHorizontalRotation(chartRotation);
  if (isHorizontalRotated) {
    const crosshairTop = cursorPosition.y + top;
    return {
      left,
      width,
      top: crosshairTop,
      height: 0,
    };
  } else {
    const crosshairLeft = cursorPosition.x + left;

    return {
      top,
      left: crosshairLeft,
      width: 0,
      height,
    };
  }
}

export function getCursorBandPosition(
  chartRotation: Rotation,
  chartDimensions: Dimensions,
  cursorPosition: Point,
  invertedValue: {
    value: any;
    withinBandwidth: boolean;
  },
  snapEnabled: boolean,
  xScale: Scale,
  totalBarsInCluster?: number,
): Dimensions & { visible: boolean } {
  const { top, left, width, height } = chartDimensions;
  const { x, y } = cursorPosition;
  const isHorizontalRotated = isHorizontalRotation(chartRotation);
  const chartWidth = isHorizontalRotated ? width : height;
  const chartHeight = isHorizontalRotated ? height : width;

  if (x > chartWidth || y > chartHeight || x < 0 || y < 0 || !invertedValue.withinBandwidth) {
    return {
      top: -1,
      left: -1,
      width: 0,
      height: 0,
      visible: false,
    };
  }
  const snappedPosition = getSnapPosition(invertedValue.value, xScale, totalBarsInCluster);
  if (!snappedPosition) {
    return {
      top: -1,
      left: -1,
      width: 0,
      height: 0,
      visible: false,
    };
  }

  const { position, band } = snappedPosition;
  const bandOffset = xScale.bandwidth > 0 ? band : 0;

  if (isHorizontalRotated) {
    const adjustedLeft = snapEnabled ? position : cursorPosition.x;
    let leftPosition = chartRotation === 0 ? left + adjustedLeft : left + width - adjustedLeft - bandOffset;
    let adjustedWidth = band;
    if (band > 1 && leftPosition + band > left + width) {
      adjustedWidth = left + width - leftPosition;
    } else if (band > 1 && leftPosition < left) {
      adjustedWidth = band - (left - leftPosition);
      leftPosition = left;
    }
    return {
      top,
      left: leftPosition,
      width: adjustedWidth,
      height,
      visible: true,
    };
  } else {
    const adjustedTop = snapEnabled ? position : cursorPosition.x;
    let topPosition = chartRotation === 90 ? top + adjustedTop : height + top - adjustedTop - bandOffset;
    let adjustedHeight = band;
    if (band > 1 && topPosition + band > top + height) {
      adjustedHeight = band - (topPosition + band - (top + height));
    } else if (band > 1 && topPosition < top) {
      adjustedHeight = band - (top - topPosition);
      topPosition = top;
    }
    return {
      top: topPosition,
      left,
      width,
      height: adjustedHeight,
      visible: true,
    };
  }
}

export function getTooltipPosition(
  chartDimensions: Dimensions,
  chartRotation: Rotation,
  cursorBandPosition: Dimensions,
  cursorPosition: { x: number; y: number },
  isSingleValueXScale: boolean,
): TooltipPosition {
  const isHorizontalRotated = isHorizontalRotation(chartRotation);
  const hPosition = getHorizontalTooltipPosition(
    cursorPosition.x,
    cursorBandPosition,
    chartDimensions,
    isHorizontalRotated,
    isSingleValueXScale,
  );
  const vPosition = getVerticalTooltipPosition(
    cursorPosition.y,
    cursorBandPosition,
    chartDimensions,
    isHorizontalRotated,
    isSingleValueXScale,
  );
  return {
    vPosition: {
      ...vPosition,
      isHorizontalRotated,
    },
    hPosition: {
      ...hPosition,
      isHorizontalRotated,
    },
  };
}

export function getHorizontalTooltipPosition(
  cursorXPosition: number,
  cursorBandPosition: Dimensions,
  chartDimensions: Dimensions,
  isHorizontalRotated: boolean,
  isSingleValueXScale: boolean,
): { bandLeft: number; bandWidth: number } {
  if (isHorizontalRotated) {
    return {
      bandLeft: cursorBandPosition.left,
      bandWidth: isSingleValueXScale ? 0 : cursorBandPosition.width,
    };
  } else {
    return {
      bandWidth: 0,
      bandLeft: chartDimensions.left + cursorXPosition,
    };
  }
}

export function getVerticalTooltipPosition(
  cursorYPosition: number,
  cursorBandPosition: Dimensions,
  chartDimensions: Dimensions,
  isHorizontalRotated: boolean,
  isSingleValueXScale: boolean,
): {
  bandHeight: number;
  bandTop: number;
} {
  if (isHorizontalRotated) {
    return {
      bandHeight: 0,
      bandTop: cursorYPosition + chartDimensions.top,
    };
  } else {
    return {
      bandHeight: isSingleValueXScale ? 0 : cursorBandPosition.height,
      bandTop: cursorBandPosition.top,
    };
  }
}

export function getFinalTooltipPosition(
  chartContainerBBox: Dimensions,
  tooltipBBox: Dimensions,
  tooltipPosition: TooltipPosition,
  padding = 10,
): {
  left: string | null;
  top: string | null;
} {
  const { hPosition, vPosition } = tooltipPosition;
  const tooltipStyle: {
    left: string | null;
    top: string | null;
  } = {
    left: null,
    top: null,
  };
  if (hPosition.isHorizontalRotated) {
    if (hPosition.bandLeft + hPosition.bandWidth + tooltipBBox.width + padding > chartContainerBBox.width) {
      const left =
        window.scrollX + chartContainerBBox.left + tooltipPosition.hPosition.bandLeft - tooltipBBox.width - padding;
      tooltipStyle.left = `${left}px`;
    } else {
      const left =
        window.scrollX +
        chartContainerBBox.left +
        tooltipPosition.hPosition.bandLeft +
        tooltipPosition.hPosition.bandWidth +
        padding;
      tooltipStyle.left = `${left}px`;
    }
  } else {
    if (hPosition.bandLeft + hPosition.bandWidth + tooltipBBox.width > chartContainerBBox.width) {
      const left = window.scrollX + chartContainerBBox.left + chartContainerBBox.width - tooltipBBox.width;
      tooltipStyle.left = `${left}px`;
    } else {
      const left =
        window.scrollX +
        chartContainerBBox.left +
        tooltipPosition.hPosition.bandLeft +
        tooltipPosition.hPosition.bandWidth;
      tooltipStyle.left = `${left}px`;
    }
  }
  if (hPosition.isHorizontalRotated) {
    if (vPosition.bandTop + tooltipBBox.height > chartContainerBBox.height) {
      const top = window.scrollY + chartContainerBBox.top + chartContainerBBox.height - tooltipBBox.height;
      tooltipStyle.top = `${top}px`;
    } else {
      const top = window.scrollY + chartContainerBBox.top + vPosition.bandTop;
      tooltipStyle.top = `${top}px`;
    }
  } else {
    if (vPosition.bandTop + vPosition.bandHeight + tooltipBBox.height + padding > chartContainerBBox.height) {
      const top = window.scrollY + chartContainerBBox.top + vPosition.bandTop - tooltipBBox.height - padding;
      tooltipStyle.top = `${top}px`;
    } else {
      const top = window.scrollY + chartContainerBBox.top + vPosition.bandTop + vPosition.bandHeight + padding;
      tooltipStyle.top = `${top}px`;
    }
  }
  return tooltipStyle;
}
