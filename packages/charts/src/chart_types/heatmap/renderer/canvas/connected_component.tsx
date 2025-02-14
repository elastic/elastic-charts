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
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { renderHeatmapCanvas2d } from './canvas_renderers';
import type { Color } from '../../../../common/colors';
import { Colors } from '../../../../common/colors';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { Dimensions } from '../../../../utils/dimensions';
import type { GenericDomain } from '../../../../utils/domain';
import { deepEqual } from '../../../../utils/fast_deep_equal';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { Theme } from '../../../../utils/themes/theme';
import type { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { nullShapeViewModel } from '../../layout/types/viewmodel_types';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import type { ChartElementSizes } from '../../state/selectors/compute_chart_element_sizes';
import { computeChartElementSizesSelector } from '../../state/selectors/compute_chart_element_sizes';
import { getHeatmapContainerSizeSelector } from '../../state/selectors/get_heatmap_container_size';
import { getHighlightedLegendBandsSelector } from '../../state/selectors/get_highlighted_legend_bands';
import { getPerPanelHeatmapGeometries } from '../../state/selectors/get_per_panel_heatmap_geometries';

/** @internal */
export interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  chartContainerDimensions: Dimensions;
  highlightedLegendBands: Array<GenericDomain>;
  theme: Theme;
  a11ySettings: A11ySettings;
  background: Color;
  elementSizes: ChartElementSizes;
  debug: boolean;
  chartDimensions: Dimensions;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;
class Component extends React.Component<Props> {
  static displayName = 'Heatmap';

  // firstRender = true; // this will be useful for stable resizing of treemaps
  private ctx: CanvasRenderingContext2D | null;

  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
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

  shouldComponentUpdate(nextProps: ReactiveChartStateProps) {
    return !deepEqual(this.props, nextProps);
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

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  private drawCanvas() {
    if (this.ctx) {
      renderHeatmapCanvas2d(this.ctx, this.devicePixelRatio, this.props);
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    const {
      initialized,
      chartContainerDimensions: { width, height },
      forwardStageRef,
      a11ySettings,
    } = this.props;
    if (!initialized || width === 0 || height === 0) {
      return null;
    }
    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        >
          <ScreenReaderSummary />
        </canvas>
      </figure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  geometries: nullShapeViewModel(),
  chartContainerDimensions: { width: 0, height: 0, left: 0, top: 0 },
  theme: LIGHT_THEME,
  highlightedLegendBands: [],
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  background: Colors.Transparent.keyword,
  elementSizes: {
    xAxis: { width: 0, height: 0, left: 0, top: 0 },
    yAxis: { width: 0, height: 0, left: 0, top: 0 },
    xAxisTickCadence: 1,
    xLabelRotation: 0,
  },
  debug: false,
  chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (getInternalIsInitializedSelector(state, internalChartState) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    geometries: getPerPanelHeatmapGeometries(state),
    chartContainerDimensions: getHeatmapContainerSizeSelector(state),
    highlightedLegendBands: getHighlightedLegendBandsSelector(state),
    theme: getChartThemeSelector(state),
    a11ySettings: getA11ySettingsSelector(state),
    background: getChartThemeSelector(state).background.color,
    elementSizes: computeChartElementSizesSelector(state),
    debug: getSettingsSpecSelector(state).debug,
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
  };
};

/** @internal */
export const Heatmap = connect(mapStateToProps, mapDispatchToProps)(Component);
