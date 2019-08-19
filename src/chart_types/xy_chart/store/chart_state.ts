import { action, computed, IObservableValue, observable } from 'mobx';
import * as uuid from 'uuid';

import {
  AxisLinePosition,
  AxisTick,
  AxisTicksDimensions,
  computeAxisTicksDimensions,
  getAxisTicksPositions,
  mergeYCustomDomainsByGroupId,
} from '../utils/axis_utils';
import { CanvasTextBBoxCalculator } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { XDomain } from '../domains/x_domain';
import { YDomain } from '../domains/y_domain';
import { computeLegend, LegendItem } from '../legend/legend';
import {
  AreaGeometry,
  BarGeometry,
  GeometryValue,
  IndexedGeometry,
  isPointOnGeometry as isPointerOnGeometry,
  LineGeometry,
  PointGeometry,
} from '../rendering/rendering';
import { countBarsInCluster } from '../utils/scales';
import {
  DataSeriesColorsValues,
  findDataSeriesByColorValues,
  FormattedDataSeries,
  getSeriesColorMap,
  RawDataSeries,
} from '../utils/series';
import {
  AnnotationSpec,
  AnnotationTypes,
  AreaSeriesSpec,
  AxisSpec,
  BarSeriesSpec,
  BasicSeriesSpec,
  DomainRange,
  isLineAnnotation,
  isRectAnnotation,
  LineSeriesSpec,
  Position,
  Rendering,
  Rotation,
} from '../utils/specs';
import { formatTooltip, getSeriesTooltipValues } from '../tooltip/tooltip';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import { mergeWithDefaultAnnotationLine, mergeWithDefaultAnnotationRect, Theme } from '../../../utils/themes/theme';
import { compareByValueAsc } from '../../../utils/commons';
import { computeChartDimensions } from '../utils/dimensions';
import { Dimensions } from '../../../utils/dimensions';
import { Domain } from '../../../utils/domain';
import { AnnotationId, AxisId, GroupId, SpecId } from '../../../utils/ids';
import {
  areIndexedGeometryArraysEquals,
  getValidXPosition,
  getValidYPosition,
  isCrosshairTooltipType,
  isFollowTooltipType,
  isNoneTooltipType,
  TooltipType,
  TooltipValue,
  TooltipValueFormatter,
} from '../utils/interactions';
import { Scale, ScaleType } from '../../../utils/scales/scales';
import { DEFAULT_TOOLTIP_SNAP, DEFAULT_TOOLTIP_TYPE, CursorEvent } from '../../../specs/settings';
import {
  AnnotationDimensions,
  computeAnnotationDimensions,
  computeAnnotationTooltipState,
} from '../annotations/annotation_utils';
import {
  getCursorBandPosition,
  getCursorLinePosition,
  getTooltipPosition,
  getPosition,
} from '../crosshair/crosshair_utils';
import {
  BrushExtent,
  computeBrushExtent,
  computeChartTransform,
  computeSeriesDomains,
  computeSeriesGeometries,
  getAxesSpecForSpecId,
  getUpdatedCustomSeriesColors,
  isAllSeriesDeselected,
  isChartAnimatable,
  isHistogramModeEnabled,
  isLineAreaOnlyChart,
  setBarSeriesAccessors,
  Transform,
  updateDeselectedDataSeries,
} from './utils';

export interface Point {
  x: number;
  y: number;
}
export interface SeriesDomainsAndData {
  xDomain: XDomain;
  yDomain: YDomain[];
  splittedDataSeries: RawDataSeries[][];
  formattedDataSeries: {
    stacked: FormattedDataSeries[];
    nonStacked: FormattedDataSeries[];
  };
  seriesColors: Map<string, DataSeriesColorsValues>;
}

export type ElementClickListener = (values: GeometryValue[]) => void;
export type ElementOverListener = (values: GeometryValue[]) => void;
export type BrushEndListener = (min: number, max: number) => void;
export type LegendItemListener = (dataSeriesIdentifiers: DataSeriesColorsValues | null) => void;
export type CursorUpdateListener = (event?: CursorEvent) => void;

export class ChartStore {
  debug = false;
  id = uuid.v4();
  specsInitialized = observable.box(false);
  initialized = observable.box(false);
  enableHistogramMode = observable.box(false);

  parentDimensions: Dimensions = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  };
  chartDimensions: Dimensions = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  };
  chartTransform: Transform = {
    x: 0,
    y: 0,
    rotate: 0,
  };
  isBrushing = observable.box(false);
  brushExtent: BrushExtent = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  };

  chartRotation: Rotation = 0; // updated from jsx
  chartRendering: Rendering = 'canvas'; // updated from jsx
  chartTheme: Theme = LIGHT_THEME; // updated from jsx
  axesSpecs: Map<AxisId, AxisSpec> = new Map(); // readed from jsx
  axesTicksDimensions: Map<AxisId, AxisTicksDimensions> = new Map(); // computed
  axesPositions: Map<AxisId, Dimensions> = new Map(); // computed
  axesVisibleTicks: Map<AxisId, AxisTick[]> = new Map(); // computed
  axesTicks: Map<AxisId, AxisTick[]> = new Map(); // computed
  axesGridLinesPositions: Map<AxisId, AxisLinePosition[]> = new Map(); // computed

  annotationSpecs = new Map<AnnotationId, AnnotationSpec>(); // read from jsx

  annotationDimensions = observable.map<AnnotationId, AnnotationDimensions>(new Map());

  seriesSpecs: Map<SpecId, BasicSeriesSpec> = new Map(); // readed from jsx
  isChartEmpty: boolean = true;
  activeChartId?: string;
  seriesDomainsAndData?: SeriesDomainsAndData; // computed
  xScale?: Scale;
  yScales?: Map<GroupId, Scale>;
  // custom X domain passed via <Settings />
  customXDomain?: Domain | DomainRange;

  legendItems: Map<string, LegendItem> = new Map();
  highlightedLegendItemKey: IObservableValue<string | null> = observable.box(null);
  selectedLegendItemKey: IObservableValue<string | null> = observable.box(null);
  // deselected/hidden data series from the legend
  deselectedDataSeries: DataSeriesColorsValues[] | null = null;
  customSeriesColors: Map<string, string> = new Map();
  seriesColorMap: Map<string, string> = new Map();
  totalBarsInCluster?: number;

  tooltipData = observable.array<TooltipValue>([], { deep: false });
  tooltipType = observable.box<TooltipType>(DEFAULT_TOOLTIP_TYPE);
  tooltipSnap = observable.box<boolean>(DEFAULT_TOOLTIP_SNAP);
  tooltipPosition = observable.object<{ transform: string }>({ transform: '' });
  tooltipHeaderFormatter?: TooltipValueFormatter;

  /** cursorPosition is used by tooltip, so this is a way to expose the position for other uses */
  rawCursorPosition = observable.object<{ x: number; y: number }>({ x: -1, y: -1 }, undefined, {
    deep: false,
  });

  /** position of the cursor relative to the chart */
  cursorPosition = observable.object<{ x: number; y: number }>({ x: -1, y: -1 }, undefined, {
    deep: false,
  });
  cursorBandPosition = observable.object<Dimensions>({ top: -1, left: -1, height: -1, width: -1 }, undefined, {
    deep: false,
  });
  cursorLinePosition = observable.object<Dimensions>({ top: -1, left: -1, height: -1, width: -1 }, undefined, {
    deep: false,
  });

  onElementClickListener?: ElementClickListener;
  onElementOverListener?: ElementOverListener;
  onElementOutListener?: () => undefined | void;
  onBrushEndListener?: BrushEndListener;
  onLegendItemOverListener?: LegendItemListener;
  onLegendItemOutListener?: () => undefined | void;
  onLegendItemClickListener?: LegendItemListener;
  onLegendItemPlusClickListener?: LegendItemListener;
  onLegendItemMinusClickListener?: LegendItemListener;
  onLegendItemVisibilityToggleClickListener?: LegendItemListener;
  onCursorUpdateListener?: CursorUpdateListener;

  geometries: {
    points: PointGeometry[];
    bars: BarGeometry[];
    areas: AreaGeometry[];
    lines: LineGeometry[];
  } | null = null;

  geometriesIndex: Map<any, IndexedGeometry[]> = new Map();
  geometriesIndexKeys: any[] = [];
  highlightedGeometries = observable.array<IndexedGeometry>([], { deep: false });

  animateData = false;
  /**
   * Define if the chart can be animated or not depending
   * on the global configuration and on the number of elements per series
   */
  canDataBeAnimated = false;

  showLegend = observable.box(false);
  legendCollapsed = observable.box(false);
  legendPosition: Position | undefined;
  showLegendDisplayValue = observable.box(true);

  toggleLegendCollapsed = action(() => {
    this.legendCollapsed.set(!this.legendCollapsed.get());
    this.computeChart();
  });

  /**
   * determine if crosshair cursor should be visible based on cursor position and brush enablement
   */
  isCrosshairCursorVisible = computed(() => {
    const { x: xPos, y: yPos } = this.cursorPosition;

    if (yPos < 0 || xPos < 0) {
      return false;
    }

    return this.isBrushEnabled();
  });

  /**
   * determine if chart is currently active
   */
  isActiveChart = computed(() => {
    return !this.activeChartId ? true : this.activeChartId === this.id;
  });

  /**
   * set activeChartId
   */
  setActiveChartId = (chartId?: string) => {
    this.activeChartId = chartId;
  };

  /**
   * set the x value of the cursor
   */
  setCursorValue = (value: string | number) => {
    if (!this.xScale) {
      return;
    }

    const xPosition = getPosition(value, this.xScale);

    if (xPosition === undefined) {
      return;
    }

    this.setCursorPosition(xPosition + this.chartDimensions.left, this.chartDimensions.top, false);
  };

  /**
   * x and y values are relative to the container.
   */
  setCursorPosition = action((x: number, y: number, updateCursor: boolean = true) => {
    this.rawCursorPosition.x = x;
    this.rawCursorPosition.y = y;

    if (!this.seriesDomainsAndData || this.tooltipType.get() === TooltipType.None) {
      return;
    }

    // get positions relative to chart
    let xPos = x - this.chartDimensions.left;
    let yPos = y - this.chartDimensions.top;

    // limit cursorPosition to chartDimensions
    // note: to debug and inspect tooltip html, just comment the following ifs
    if (xPos < 0 || xPos >= this.chartDimensions.width) {
      xPos = -1;
    }
    if (yPos < 0 || yPos >= this.chartDimensions.height) {
      yPos = -1;
    }
    this.cursorPosition.x = xPos;
    this.cursorPosition.y = yPos;

    // hide tooltip if outside chart dimensions
    if (yPos === -1 || xPos === -1) {
      this.clearTooltipAndHighlighted();
      return;
    }

    // get the cursor position depending on the chart rotation
    const xAxisCursorPosition = getValidXPosition(xPos, yPos, this.chartRotation, this.chartDimensions);
    const yAxisCursorPosition = getValidYPosition(xPos, yPos, this.chartRotation, this.chartDimensions);

    // only if we have a valid cursor position and the necessary scale
    if (xAxisCursorPosition < 0 || !this.xScale || !this.yScales) {
      this.clearTooltipAndHighlighted();
      return;
    }

    // invert the cursor position to get the scale value
    const xValue = this.xScale.invertWithStep(xAxisCursorPosition, this.geometriesIndexKeys);

    if (updateCursor && this.onCursorUpdateListener) {
      // Get non-stepped xValue
      const value = this.xScale.invert(xAxisCursorPosition);

      this.onCursorUpdateListener({
        chartId: this.id,
        scale: this.xScale.type,
        unit: this.xScale.unit,
        value,
      });
    }

    // update che cursorBandPosition based on chart configuration
    const isLineAreaOnly = isLineAreaOnlyChart(this.seriesSpecs);
    const updatedCursorBand = getCursorBandPosition(
      this.chartRotation,
      this.chartDimensions,
      { x: xAxisCursorPosition, y: yAxisCursorPosition },
      this.isTooltipSnapEnabled.get(),
      this.xScale,
      this.geometriesIndexKeys,
      isLineAreaOnly ? 1 : this.totalBarsInCluster,
    );
    if (updatedCursorBand === undefined) {
      this.clearTooltipAndHighlighted();
      return;
    }
    Object.assign(this.cursorBandPosition, updatedCursorBand);

    const updatedCursorLine = getCursorLinePosition(this.chartRotation, this.chartDimensions, this.cursorPosition);
    Object.assign(this.cursorLinePosition, updatedCursorLine);

    const isSingleValueXScale = this.xScale.isSingleValue();

    this.tooltipPosition.transform = getTooltipPosition(
      this.chartDimensions,
      this.chartRotation,
      this.cursorBandPosition,
      this.cursorPosition,
      isSingleValueXScale,
    );

    // get the elements on at this cursor position
    const elements = this.geometriesIndex.get(xValue);

    // if no element, hide everything
    if (!elements || elements.length === 0) {
      this.clearTooltipAndHighlighted();
      return;
    }

    // build the tooltip value list
    let xValueInfo: TooltipValue | null = null;
    let oneHighlighted = false;
    const newHighlightedGeometries: IndexedGeometry[] = [];
    const tooltipValues = elements.reduce(
      (acc, indexedGeometry) => {
        const {
          geometryId: { specId },
        } = indexedGeometry;
        const spec = this.seriesSpecs.get(specId);

        // safe guard check
        if (!spec) {
          return acc;
        }
        const { xAxis, yAxis } = getAxesSpecForSpecId(this.axesSpecs, spec.groupId);

        // yScales is ensured by the enclosing if
        const yScale = this.yScales!.get(spec.groupId);
        if (!yScale) {
          return acc;
        }

        // check if the pointer is on the geometry
        let isHighlighted = false;
        if (
          this.isActiveChart.get() &&
          isPointerOnGeometry(xAxisCursorPosition, yAxisCursorPosition, indexedGeometry)
        ) {
          isHighlighted = true;
          oneHighlighted = true;
          newHighlightedGeometries.push(indexedGeometry);
        }

        // if it's a follow tooltip, and no element is highlighted
        // not add that element into the tooltip list
        if (!isHighlighted && isFollowTooltipType(this.tooltipType.get())) {
          return acc;
        }

        // format the tooltip values
        const yAxisFormatSpec = [0, 180].includes(this.chartRotation) ? yAxis : xAxis;
        const formattedTooltip = formatTooltip(indexedGeometry, spec, false, isHighlighted, yAxisFormatSpec);
        // format only one time the x value
        if (!xValueInfo) {
          // if we have a tooltipHeaderFormatter, then don't pass in the xAxis as the user will define a formatter
          const xAxisFormatSpec = [0, 180].includes(this.chartRotation) ? xAxis : yAxis;
          const formatterAxis = this.tooltipHeaderFormatter ? undefined : xAxisFormatSpec;
          xValueInfo = formatTooltip(indexedGeometry, spec, true, false, formatterAxis);
          return [xValueInfo, ...acc, formattedTooltip];
        }

        return [...acc, formattedTooltip];
      },
      [] as TooltipValue[],
    );

    // if there's an annotation rect tooltip & there isn't a single highlighted element, hide
    const annotationTooltip = this.annotationTooltipState.get();
    const hasRectAnnotationToolip = annotationTooltip && annotationTooltip.annotationType === AnnotationTypes.Rectangle;
    if (hasRectAnnotationToolip && !oneHighlighted) {
      this.clearTooltipAndHighlighted();
      return;
    }

    // check if we already have send out an over/out event on highlighted elements
    if (
      this.onElementOverListener &&
      !areIndexedGeometryArraysEquals(newHighlightedGeometries, this.highlightedGeometries.toJS())
    ) {
      if (newHighlightedGeometries.length > 0) {
        this.onElementOverListener(newHighlightedGeometries.map(({ value }) => value));
      } else {
        if (this.onElementOutListener) {
          this.onElementOutListener();
        }
      }
    }

    // update highlighted geometries observer
    this.highlightedGeometries.replace(newHighlightedGeometries);

    // update tooltip visibility
    if (tooltipValues.length === 0) {
      this.tooltipData.clear();
    } else {
      this.tooltipData.replace(tooltipValues);
    }

    // TODO move this into the renderer
    if (oneHighlighted) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  });

  legendItemTooltipValues = computed(() => {
    // update legend items with value to display
    return getSeriesTooltipValues(this.tooltipData);
  });

  annotationTooltipState = computed(() => {
    // get positions relative to chart
    const xPos = this.rawCursorPosition.x - this.chartDimensions.left;
    const yPos = this.rawCursorPosition.y - this.chartDimensions.top;

    // only if we have a valid cursor position and the necessary scale
    if (!this.xScale || !this.yScales) {
      return null;
    }

    const cursorPosition = {
      x: xPos,
      y: yPos,
    };

    const tooltipState = computeAnnotationTooltipState(
      cursorPosition,
      this.annotationDimensions,
      this.annotationSpecs,
      this.chartRotation,
      this.axesSpecs,
      this.chartDimensions,
    );

    // If there's a highlighted chart element tooltip value, don't show annotation tooltip
    if (tooltipState && tooltipState.annotationType === AnnotationTypes.Rectangle) {
      for (const tooltipValue of this.tooltipData) {
        if (tooltipValue.isHighlighted) {
          return null;
        }
      }
    }

    return tooltipState;
  });

  isTooltipVisible = computed(() => {
    return (
      !this.isBrushing.get() &&
      this.tooltipType.get() !== TooltipType.None &&
      this.cursorPosition.x > -1 &&
      this.cursorPosition.y > -1 &&
      this.tooltipData.length > 0 &&
      this.isActiveChart.get()
    );
  });

  isCrosshairVisible = computed(() => {
    return (
      !this.isBrushing.get() &&
      isCrosshairTooltipType(this.tooltipType.get()) &&
      this.cursorPosition.x > -1 &&
      this.cursorPosition.y > -1
    );
  });

  isTooltipSnapEnabled = computed(() => {
    return (this.xScale && this.xScale.bandwidth > 0) || this.tooltipSnap.get();
  });

  clearTooltipAndHighlighted = action(() => {
    // if exist any highlighted geometry, send an out element event
    if (this.onElementOutListener && this.highlightedGeometries.length > 0) {
      this.onElementOutListener();
    }
    // clear highlight geoms
    this.highlightedGeometries.clear();
    this.tooltipData.clear();

    document.body.style.cursor = 'default';

    if (this.onCursorUpdateListener && this.isActiveChart.get()) {
      this.onCursorUpdateListener();
    }
  });

  setShowLegend = action((showLegend: boolean) => {
    this.showLegend.set(showLegend);
  });

  highlightedLegendItem = computed(() => {
    const key = this.highlightedLegendItemKey.get();
    return key == null ? null : this.legendItems.get(key);
  });

  selectedLegendItem = computed(() => {
    const key = this.selectedLegendItemKey.get();
    return key == null ? null : this.legendItems.get(key);
  });

  onLegendItemOver = action((legendItemKey: string | null) => {
    this.highlightedLegendItemKey.set(legendItemKey);

    if (this.onLegendItemOverListener) {
      const currentLegendItem = this.highlightedLegendItem.get();
      const listenerData = currentLegendItem ? currentLegendItem.value : null;
      this.onLegendItemOverListener(listenerData);
    }
  });

  onLegendItemOut = action(() => {
    this.highlightedLegendItemKey.set(null);
    if (this.onLegendItemOutListener) {
      this.onLegendItemOutListener();
    }
  });

  onLegendItemClick = action((legendItemKey: string) => {
    // Disabling the select until we implement the right contextual menu
    // with extend possibility
    // if (legendItemKey !== this.selectedLegendItemKey.get()) {
    // this.selectedLegendItemKey.set(legendItemKey);
    // } else {
    //   this.selectedLegendItemKey.set(null);
    // }
    if (this.onLegendItemClickListener) {
      const currentLegendItem = legendItemKey == null ? null : this.legendItems.get(legendItemKey);
      const listenerData = currentLegendItem ? currentLegendItem.value : null;
      this.onLegendItemClickListener(listenerData);
    }
  });

  onLegendItemPlusClick = action(() => {
    if (this.onLegendItemPlusClickListener) {
      const currentLegendItem = this.selectedLegendItem.get();
      const listenerData = currentLegendItem ? currentLegendItem.value : null;
      this.onLegendItemPlusClickListener(listenerData);
    }
  });

  onLegendItemMinusClick = action(() => {
    if (this.onLegendItemMinusClickListener) {
      const currentLegendItem = this.selectedLegendItem.get();
      const listenerData = currentLegendItem ? currentLegendItem.value : null;
      this.onLegendItemMinusClickListener(listenerData);
    }
  });

  toggleSingleSeries = action((legendItemKey: string) => {
    const legendItem = this.legendItems.get(legendItemKey);

    if (legendItem) {
      if (findDataSeriesByColorValues(this.deselectedDataSeries, legendItem.value) > -1) {
        this.deselectedDataSeries = [...this.legendItems.values()]
          .filter((item: LegendItem) => item.key !== legendItemKey)
          .map((item: LegendItem) => item.value);
      } else {
        this.deselectedDataSeries = [legendItem.value];
      }

      this.computeChart();
    }
  });

  toggleSeriesVisibility = action((legendItemKey: string) => {
    const legendItem = this.legendItems.get(legendItemKey);

    if (legendItem) {
      this.deselectedDataSeries = updateDeselectedDataSeries(this.deselectedDataSeries, legendItem.value);
      this.computeChart();
    }
  });

  setSeriesColor = action((legendItemKey: string, color: string) => {
    const legendItem = this.legendItems.get(legendItemKey);

    if (legendItem) {
      const { specId } = legendItem.value;

      const spec = this.seriesSpecs.get(specId);
      if (spec) {
        if (spec.customSeriesColors) {
          spec.customSeriesColors.set(legendItem.value, color);
        } else {
          const specCustomSeriesColors = new Map();
          spec.customSeriesColors = specCustomSeriesColors;
          spec.customSeriesColors.set(legendItem.value, color);
        }
      }

      this.computeChart();
    }
  });

  onBrushStart = action(() => {
    if (!this.onBrushEndListener) {
      return;
    }
    this.isBrushing.set(true);
  });

  onBrushEnd = action((start: Point, end: Point) => {
    if (!this.onBrushEndListener) {
      return;
    }
    this.isBrushing.set(false);
    const minValue = start.x < end.x ? start.x : end.x;
    const maxValue = start.x > end.x ? start.x : end.x;
    if (maxValue === minValue) {
      // if 0 size brush, avoid computing the value
      return;
    }
    const min = this.xScale!.invert(minValue - this.chartDimensions.left);
    const max = this.xScale!.invert(maxValue - this.chartDimensions.left);
    this.onBrushEndListener(min, max);
  });

  handleChartClick() {
    if (this.highlightedGeometries.length > 0 && this.onElementClickListener) {
      this.onElementClickListener(this.highlightedGeometries.toJS().map(({ value }) => value));
    }
  }

  resetDeselectedDataSeries() {
    this.deselectedDataSeries = null;
  }

  setOnElementClickListener(listener: ElementClickListener) {
    this.onElementClickListener = listener;
  }
  setOnElementOverListener(listener: ElementOverListener) {
    this.onElementOverListener = listener;
  }
  setOnElementOutListener(listener: () => undefined | void) {
    this.onElementOutListener = listener;
  }
  setOnBrushEndListener(listener: BrushEndListener) {
    this.onBrushEndListener = listener;
  }
  setOnLegendItemOverListener(listener: LegendItemListener) {
    this.onLegendItemOverListener = listener;
  }
  setOnLegendItemOutListener(listener: () => undefined | void) {
    this.onLegendItemOutListener = listener;
  }
  setOnLegendItemClickListener(listener: LegendItemListener) {
    this.onLegendItemClickListener = listener;
  }
  setOnLegendItemPlusClickListener(listener: LegendItemListener) {
    this.onLegendItemPlusClickListener = listener;
  }
  setOnLegendItemMinusClickListener(listener: LegendItemListener) {
    this.onLegendItemMinusClickListener = listener;
  }
  setOnCursorUpdateListener(listener: CursorUpdateListener) {
    this.onCursorUpdateListener = listener;
  }
  removeElementClickListener() {
    this.onElementClickListener = undefined;
  }
  removeElementOverListener() {
    this.onElementOverListener = undefined;
  }
  removeElementOutListener() {
    this.onElementOutListener = undefined;
  }
  removeOnLegendItemOverListener() {
    this.onLegendItemOverListener = undefined;
  }
  removeOnLegendItemOutListener() {
    this.onLegendItemOutListener = undefined;
  }
  removeOnLegendItemPlusClickListener() {
    this.onLegendItemPlusClickListener = undefined;
  }
  removeOnLegendItemMinusClickListener() {
    this.onLegendItemMinusClickListener = undefined;
  }
  removeOnCursorUpdateListener() {
    this.onCursorUpdateListener = undefined;
  }

  isBrushEnabled(): boolean {
    if (!this.xScale) {
      return false;
    }
    return this.xScale.type !== ScaleType.Ordinal && Boolean(this.onBrushEndListener);
  }

  updateParentDimensions(width: number, height: number, top: number, left: number) {
    let isChanged = false;
    if (width !== this.parentDimensions.width) {
      isChanged = true;
      this.parentDimensions.width = width;
    }
    if (height !== this.parentDimensions.height) {
      isChanged = true;
      this.parentDimensions.height = height;
    }
    if (top !== this.parentDimensions.top) {
      isChanged = true;
      this.parentDimensions.top = top;
    }
    if (left !== this.parentDimensions.left) {
      isChanged = true;
      this.parentDimensions.left = left;
    }
    if (isChanged) {
      this.computeChart();
    }
  }
  addSeriesSpec(seriesSpec: BasicSeriesSpec | LineSeriesSpec | AreaSeriesSpec | BarSeriesSpec) {
    this.seriesSpecs.set(seriesSpec.id, seriesSpec);

    const isEnabled = isHistogramModeEnabled(this.seriesSpecs);
    this.enableHistogramMode.set(isEnabled);

    setBarSeriesAccessors(isEnabled, this.seriesSpecs);
  }
  removeSeriesSpec(specId: SpecId) {
    this.seriesSpecs.delete(specId);

    const isEnabled = isHistogramModeEnabled(this.seriesSpecs);
    this.enableHistogramMode.set(isEnabled);

    setBarSeriesAccessors(isEnabled, this.seriesSpecs);
  }

  /**
   * Add an axis spec to the store
   * @param axisSpec an axis spec
   */
  addAxisSpec(axisSpec: AxisSpec) {
    this.axesSpecs.set(axisSpec.id, axisSpec);
  }
  removeAxisSpec(axisId: AxisId) {
    this.axesSpecs.delete(axisId);
  }

  addAnnotationSpec(annotationSpec: AnnotationSpec) {
    if (isLineAnnotation(annotationSpec)) {
      const { style } = annotationSpec;

      const mergedLineStyle = mergeWithDefaultAnnotationLine(style);
      annotationSpec.style = mergedLineStyle;
    }
    if (isRectAnnotation(annotationSpec)) {
      const { style } = annotationSpec;

      const mergedRectStyle = mergeWithDefaultAnnotationRect(style);
      annotationSpec.style = mergedRectStyle;
    }
    this.annotationSpecs.set(annotationSpec.annotationId, annotationSpec);
  }

  removeAnnotationSpec(annotationId: AnnotationId) {
    this.annotationSpecs.delete(annotationId);
  }

  computeChart() {
    this.initialized.set(false);
    // compute only if parent dimensions are computed
    if (this.parentDimensions.width === 0 || this.parentDimensions.height === 0) {
      return;
    }
    // avoid compute if no specs are specified
    if (this.seriesSpecs.size === 0) {
      return;
    }

    // When specs are not initialized, reset selectedDataSeries to null
    if (!this.specsInitialized.get()) {
      this.deselectedDataSeries = null;
    }

    // merge Y custom domains specified on the axis
    const customYDomainsByGroupId = mergeYCustomDomainsByGroupId(this.axesSpecs, this.chartRotation);

    // compute general X and Y domains, split series based on split accessors
    // process stacked and non-stacked values series formatting the data
    this.seriesDomainsAndData = computeSeriesDomains(
      this.seriesSpecs,
      customYDomainsByGroupId,
      this.customXDomain,
      this.deselectedDataSeries,
    );

    // Merge all series spec custom colors with state custom colors map
    const updatedCustomSeriesColors = getUpdatedCustomSeriesColors(this.seriesSpecs);
    this.customSeriesColors = new Map([...this.customSeriesColors, ...updatedCustomSeriesColors]);

    this.seriesColorMap = getSeriesColorMap(
      this.seriesDomainsAndData.seriesColors,
      this.chartTheme.colors,
      this.customSeriesColors,
    );

    this.legendItems = computeLegend(
      this.seriesDomainsAndData.seriesColors,
      this.seriesColorMap,
      this.seriesSpecs,
      this.chartTheme.colors.defaultVizColor,
      this.axesSpecs,
      this.deselectedDataSeries,
    );

    this.isChartEmpty = isAllSeriesDeselected(this.legendItems);

    const { xDomain, yDomain, formattedDataSeries } = this.seriesDomainsAndData;

    // compute how many bar series are clustered
    const { totalBarsInCluster } = countBarsInCluster(formattedDataSeries.stacked, formattedDataSeries.nonStacked);
    this.totalBarsInCluster = totalBarsInCluster;

    // compute axis dimensions
    const bboxCalculator = new CanvasTextBBoxCalculator();
    const barsPadding = this.enableHistogramMode.get()
      ? this.chartTheme.scales.histogramPadding
      : this.chartTheme.scales.barsPadding;

    this.axesTicksDimensions.clear();
    this.axesSpecs.forEach((axisSpec) => {
      const { id } = axisSpec;
      const dimensions = computeAxisTicksDimensions(
        axisSpec,
        xDomain,
        yDomain,
        totalBarsInCluster,
        bboxCalculator,
        this.chartRotation,
        this.chartTheme.axes,
        barsPadding,
        this.enableHistogramMode.get(),
      );
      if (dimensions) {
        this.axesTicksDimensions.set(id, dimensions);
      }
    });
    bboxCalculator.destroy();

    // // compute chart dimensions
    const computedChartDims = computeChartDimensions(
      this.parentDimensions,
      this.chartTheme,
      this.axesTicksDimensions,
      this.axesSpecs,
      this.showLegend.get() && !this.legendCollapsed.get(),
      this.legendPosition,
    );
    this.chartDimensions = computedChartDims.chartDimensions;

    this.chartTransform = computeChartTransform(this.chartDimensions, this.chartRotation);
    this.brushExtent = computeBrushExtent(this.chartDimensions, this.chartRotation, this.chartTransform);

    const seriesGeometries = computeSeriesGeometries(
      this.seriesSpecs,
      xDomain,
      yDomain,
      formattedDataSeries,
      this.seriesColorMap,
      this.chartTheme,
      this.chartDimensions,
      this.chartRotation,
      this.axesSpecs,
      this.enableHistogramMode.get(),
    );

    // tslint:disable-next-line:no-console
    this.geometries = seriesGeometries.geometries;
    this.xScale = seriesGeometries.scales.xScale;

    const isSingleValueXScale = this.xScale.isSingleValue();
    if (isSingleValueXScale && !isNoneTooltipType(this.tooltipType.get())) {
      this.tooltipType.set(TooltipType.Follow);
    }

    this.yScales = seriesGeometries.scales.yScales;
    this.geometriesIndex = seriesGeometries.geometriesIndex;
    this.geometriesIndexKeys = [...this.geometriesIndex.keys()].sort(compareByValueAsc);

    // compute visible ticks and their positions
    const axisTicksPositions = getAxisTicksPositions(
      computedChartDims,
      this.chartTheme,
      this.chartRotation,
      this.showLegend.get() && !this.legendCollapsed.get(),
      this.axesSpecs,
      this.axesTicksDimensions,
      xDomain,
      yDomain,
      totalBarsInCluster,
      this.enableHistogramMode.get(),
      this.legendPosition,
      barsPadding,
    );
    // tslint:disable-next-line:no-console
    this.axesPositions = axisTicksPositions.axisPositions;
    this.axesTicks = axisTicksPositions.axisTicks;
    this.axesVisibleTicks = axisTicksPositions.axisVisibleTicks;
    this.axesGridLinesPositions = axisTicksPositions.axisGridLinesPositions;

    // annotation computations
    const updatedAnnotationDimensions = computeAnnotationDimensions(
      this.annotationSpecs,
      this.chartDimensions,
      this.chartRotation,
      this.yScales,
      this.xScale,
      this.axesSpecs,
      this.totalBarsInCluster,
      this.enableHistogramMode.get(),
    );

    this.annotationDimensions.replace(updatedAnnotationDimensions);

    this.canDataBeAnimated = isChartAnimatable(seriesGeometries.geometriesCounts, this.animateData);
    // temporary disabled until
    // https://github.com/elastic/elastic-charts/issues/89 and https://github.com/elastic/elastic-charts/issues/41
    this.canDataBeAnimated = false;
    this.initialized.set(true);
  }
}
