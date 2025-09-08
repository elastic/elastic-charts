/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { MouseEvent, RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { renderLinearPartitionCanvas2d } from './canvas_linear_renderers';
import { renderPartitionCanvas2d } from './canvas_renderers';
import { renderWrappedPartitionCanvas2d } from './canvas_wrapped_renderers';
import type { Color } from '../../../../common/colors';
import { Colors } from '../../../../common/colors';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { clearCanvas } from '../../../../renderers/canvas';
import type { SettingsSpec } from '../../../../specs/settings';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { Dimensions } from '../../../../utils/dimensions';
import { MODEL_KEY } from '../../layout/config';
import type { QuadViewModel, ShapeViewModel, SmallMultiplesDescriptors } from '../../layout/types/viewmodel_types';
import { hasMostlyRTLLabels, nullShapeViewModel } from '../../layout/types/viewmodel_types';
import { INPUT_KEY } from '../../layout/utils/group_by_rollup';
import { isSimpleLinear, isWaffle } from '../../layout/viewmodel/viewmodel';
import { partitionDrilldownFocus, partitionMultiGeometries } from '../../state/selectors/geometries';
import { ScreenReaderPartitionTable } from '../dom/screen_reader_partition_table';

/** @internal */
export interface ContinuousDomainFocus {
  currentFocusX0: number;
  currentFocusX1: number;
  prevFocusX0: number;
  prevFocusX1: number;
}

/** @internal */
export interface IndexedContinuousDomainFocus extends ContinuousDomainFocus, SmallMultiplesDescriptors {}

interface ReactiveChartStateProps {
  isRTL: boolean;
  initialized: boolean;
  geometries: ShapeViewModel;
  geometriesFoci: ContinuousDomainFocus[];
  multiGeometries: ShapeViewModel[];
  chartDimensions: Dimensions;
  a11ySettings: A11ySettings;
  debug: SettingsSpec['debug'];
  background: Color;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type PartitionProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

/** @internal */
export type AnimationState = { rafId: number };

class PartitionComponent extends React.Component<PartitionProps> {
  static displayName = 'Partition';

  // firstRender = true; // this will be useful for stable resizing of treemaps
  private ctx: CanvasRenderingContext2D | null;
  private animationState: AnimationState;

  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<PartitionProps>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
    this.animationState = { rafId: NaN };
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  handleMouseMove(e: MouseEvent<HTMLCanvasElement>) {
    const {
      initialized,
      chartDimensions: { width, height },
      forwardStageRef,
    } = this.props;
    const [focus] = this.props.geometriesFoci;
    if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0 || !focus) {
      return;
    }
    const picker = this.props.geometries.pickQuads;
    const box = forwardStageRef.current.getBoundingClientRect();
    const { diskCenter } = this.props.geometries;
    const x = e.clientX - box.left - diskCenter.x;
    const y = e.clientY - box.top - diskCenter.y;
    const pickedShapes: Array<QuadViewModel> = picker(x, y, focus);
    const datumIndices = new Set();
    pickedShapes.forEach((shape) => {
      const node = shape[MODEL_KEY];
      const shapeNode = node.children.find(([key]) => key === shape.dataName);
      if (shapeNode) {
        const indices = shapeNode[1][INPUT_KEY] || [];
        indices.forEach((i) => datumIndices.add(i));
      }
    });

    return pickedShapes; // placeholder
  }

  render() {
    const {
      forwardStageRef,
      initialized,
      chartDimensions: { width, height },
      a11ySettings,
      debug,
      isRTL,
    } = this.props;
    return width === 0 || height === 0 || !initialized ? null : (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <canvas
          dir={isRTL ? 'rtl' : 'ltr'}
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          onMouseMove={this.handleMouseMove.bind(this)}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        >
          <ScreenReaderSummary />
          {!debug && <ScreenReaderPartitionTable />}
        </canvas>
        {debug && <ScreenReaderPartitionTable />}
      </figure>
    );
  }

  private drawCanvas() {
    if (this.ctx) {
      const { ctx, devicePixelRatio, props } = this;
      clearCanvas(ctx, props.background);
      props.multiGeometries.forEach((geometries, geometryIndex) => {
        const focus = props.geometriesFoci[geometryIndex];
        if (!focus) return;

        const renderer = isSimpleLinear(geometries.layout, geometries.style.fillLabel, geometries.layers)
          ? renderLinearPartitionCanvas2d
          : isWaffle(geometries.layout)
            ? renderWrappedPartitionCanvas2d
            : renderPartitionCanvas2d;
        renderer(ctx, devicePixelRatio, geometries, focus, this.animationState);
      });
    }
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators({ onChartRendered }, dispatch);

const DEFAULT_PROPS: ReactiveChartStateProps = {
  isRTL: false,
  initialized: false,
  geometries: nullShapeViewModel(),
  geometriesFoci: [],
  multiGeometries: [],
  chartDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  debug: false,
  background: Colors.Transparent.keyword,
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  const multiGeometries = partitionMultiGeometries(state);

  return {
    isRTL: hasMostlyRTLLabels(multiGeometries),
    initialized: true,
    geometries: multiGeometries[0] ?? nullShapeViewModel(),
    multiGeometries,
    chartDimensions: getChartContainerDimensionsSelector(state),
    geometriesFoci: partitionDrilldownFocus(state),
    a11ySettings: getA11ySettingsSelector(state),
    debug: getSettingsSpecSelector(state).debug,
    background: getChartThemeSelector(state).background.color,
  };
};

/** @internal */
export const Partition = connect(mapStateToProps, mapDispatchToProps)(PartitionComponent);
