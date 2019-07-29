import React from 'react';
import { Layer } from 'react-konva';
import { IChartStore, IChartState } from 'store/chart_store';
import { ChartTypes } from 'chart_types';
import { computeSeriesGeometriesSelector } from './selectors/compute_series_geometries';
import { computeChartDimensionsSelector } from './selectors/compute_chart_dimensions';
import { Tooltips } from '../renderer/dom/tooltips';
import { htmlIdGenerator } from 'utils/commons';
import { Highlighter } from '../renderer/dom/highlighter';
import { Crosshair } from '../renderer/dom/crosshair';
import { Axes } from '../renderer/canvas/axis';
import { BarValues } from '../renderer/canvas/bar_values';
import { Grid } from '../renderer/canvas/grid';
import { AnnotationTooltip } from '../renderer/dom/annotation_tooltips';
import { isBrushAvailableSelector } from './selectors/is_brush_available';
import { BrushTool } from '../renderer/dom/brush';

export class XYAxisChartStore implements IChartStore {
  chartType = ChartTypes.XYAxis;
  legendId: string = htmlIdGenerator()('legend');
  render(state: IChartState) {
    const geoms = computeSeriesGeometriesSelector(state);
    return geoms.geometries;
  }
  getChartDimensions(state: IChartState) {
    return computeChartDimensionsSelector(state).chartDimensions;
  }
  getCustomChartComponents(zIndex: number, type: 'dom' | 'svg' | 'canvas') {
    switch (type) {
      case 'dom':
        return getDomComponents(zIndex);
      case 'canvas':
        return getCanvasComponents(zIndex);
      default:
        return null;
    }
  }
  isBrushAvailable(state: IChartState) {
    return isBrushAvailableSelector(state);
  }
}

function getDomComponents(zIndex: number) {
  if (zIndex === -1) {
    return (
      <React.Fragment>
        <Crosshair />
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Tooltips />
      <AnnotationTooltip />
      <Highlighter />
      <BrushTool />
    </React.Fragment>
  );
}

function getCanvasComponents(zIndex: number): JSX.Element | null {
  if (zIndex === -1) {
    return getCanvasComponentsAtLevelMinus1();
  }
  return getCanvasComponentsAtLevel1();
}

function getCanvasComponentsAtLevelMinus1() {
  return (
    <Layer hitGraphEnabled={false} listening={false}>
      <Grid />
    </Layer>
  );
}

function getCanvasComponentsAtLevel1() {
  return (
    <Layer hitGraphEnabled={false} listening={false}>
      <Axes />
      <BarValues />
    </Layer>
  );
}
