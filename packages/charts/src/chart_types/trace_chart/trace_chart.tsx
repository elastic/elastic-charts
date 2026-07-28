/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CSSProperties, RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { NOOP, EMPTY } from './controller/constants';
import { TraceCanvasController } from './controller/trace_canvas_controller';
import type { DispatchProps, StateProps, TraceProps } from './controller/types';
import { AriaLiveRegion } from './render/aria_live_region';
import { BrushOverlay } from './render/brush_overlay';
import { KeyboardFocusBadge } from './render/keyboard_focus_badge';
import { ScreenReaderTraceAnnotations } from './render/screen_reader_trace_annotations';
import { ScreenReaderTraceTable } from './render/screen_reader_trace_table';
import { getTraceAnnotationSpecsSelector } from './state/selectors/get_annotation_specs';
import type { TraceSpec } from './trace_api';
import { ChartType } from '..';
import { ScreenReaderSummary } from '../../components/accessibility';
import { BasicTooltip } from '../../components/tooltip/tooltip';
import { TooltipType } from '../../specs';
import { SpecType } from '../../specs/spec_type'; // kept as long-winded import on separate line otherwise import circularity emerges
import { onChartRendered } from '../../state/actions/chart';
import { setTraceUncontrolledCollapsed } from '../../state/actions/trace';
import type { GlobalChartState } from '../../state/chart_state';
import type { BackwardRef, ChartRenderer } from '../../state/internal_chart_renderer';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../../state/selectors/get_tooltip_spec';
import { getSpecsFromStore } from '../../state/utils/get_specs_from_store';

/**
 * Thin React shell over {@link TraceCanvasController}. It owns the JSX / DOM refs and forwards the
 * component lifecycle to the controller, which owns all interaction/render state and the rAF loop
 * (ADR 0004 Decision 5). It holds no React state: the controller triggers re-renders via
 * `deps.requestRender()` (bound to `forceUpdate`), and `render()` reads the controller's view-state.
 */
class TraceComponent extends React.Component<TraceProps> {
  static displayName = 'Trace';

  // Ref to the visually-hidden aria-live div. textContent is set (never innerHTML) after each lane move.
  private ariaLiveRef = React.createRef<HTMLDivElement>();

  private controller: TraceCanvasController = new TraceCanvasController({
    getProps: () => this.props,
    getCanvas: () => this.props.forwardStageRef.current,
    getContainer: () => this.props.containerRef().current,
    getAriaLive: () => this.ariaLiveRef.current,
    requestRender: () => this.forceUpdate(),
  });

  componentDidMount() {
    this.controller.start();
  }

  componentDidUpdate(prevProps: TraceProps) {
    this.controller.update(prevProps);
  }

  componentWillUnmount() {
    this.controller.destroy();
  }

  render() {
    const c = this.controller;
    const {
      forwardStageRef,
      chartDimensions: { width, height },
      a11ySettings,
      tooltipRequired,
      containerRef,
    } = this.props;
    const canvasStyle: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      cursor: c.getCursor(),
      touchAction: 'none',
      outline: 'none',
    };
    const dpr = window.devicePixelRatio ?? 1;
    const tooltipPosition = c.pin.pinned
      ? { x: c.pin.x, y: c.pin.y, width: 0, height: 0 }
      : { x: c.hover.pointerX, y: c.hover.pointerY, width: 0, height: 0 };
    const tooltipVisible =
      c.pin.pinned ||
      (tooltipRequired &&
        c.hover.index >= 0 &&
        (c.hover.region !== 'empty' || this.props.traceSpec?.showTooltipOverEmpty === true));

    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          {/* ScreenReaderSummary and ScreenReaderTraceTable are siblings of the canvas inside
              the <figure> so AT can browse them with the virtual cursor. They must NOT be
              descendants of the canvas (role="application" subtree is not browsable). */}
          <ScreenReaderSummary />
          <ScreenReaderTraceTable />
          <ScreenReaderTraceAnnotations />
          <AriaLiveRegion ref={this.ariaLiveRef} />
          <canvas
            ref={forwardStageRef}
            tabIndex={0}
            className="echCanvasRenderer"
            width={width * dpr}
            height={height * dpr}
            style={canvasStyle}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="application"
          />
          <KeyboardFocusBadge visible={c.hasFocus && this.props.traceSpec?.showKeyboardFocusBadge !== false} />
        </figure>
        {c.brush.overlay && <BrushOverlay overlay={c.brush.overlay} brushTheme={this.props.theme.brush} />}
        {/* BasicTooltip is connect()-ed; it auto-reads `settings.customTooltip` from redux, so
            <Tooltip customTooltip> override is free. Pin state is self-managed (Spec 10). */}
        <BasicTooltip
          onPointerMove={NOOP}
          position={tooltipPosition}
          pinned={c.pin.pinned}
          selected={EMPTY}
          canPinTooltip={tooltipRequired}
          pinTooltip={c.pinTooltip}
          toggleSelectedTooltipItem={NOOP}
          setSelectedTooltipItems={NOOP}
          visible={tooltipVisible}
          info={c.hover.tooltipInfo}
          getChartContainerRef={containerRef}
        />
      </>
    );
  }
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const traceSpec = getSpecsFromStore<TraceSpec>(state.specs, ChartType.Trace, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    traceSpec,
    annotationSpecs: getTraceAnnotationSpecsSelector(state),
    theme: getChartThemeSelector(state),
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    tooltipRequired: getTooltipSpecSelector(state).type !== TooltipType.None,

    // mandatory charts API protocol; todo extract these mappings once there are other charts like Trace.
    // Fall back to the module-level stable NOOP (not a fresh arrow) so `connect` doesn't see changed
    // props on unrelated redux churn, and so `elementClickIsInteractive()` can identity-compare.
    onElementOver: settingsSpec.onElementOver ?? NOOP,
    onElementClick: settingsSpec.onElementClick ?? NOOP,
    onElementOut: settingsSpec.onElementOut ?? NOOP,
    onRenderChange: settingsSpec.onRenderChange ?? NOOP, // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount} data-ech-debug-state={debugStateString}
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
      setTraceUncontrolledCollapsed,
    },
    dispatch,
  );

const TraceChartLayers = connect(mapStateToProps, mapDispatchToProps)(TraceComponent);

/** @internal */
export const chartRenderer: ChartRenderer = (
  containerRef: BackwardRef,
  forwardStageRef: RefObject<HTMLCanvasElement>,
) => <TraceChartLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />;
