/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createRef, CSSProperties, RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ChartType } from '..';
import { DEFAULT_CSS_CURSOR } from '../../common/constants';
import { bindFramebuffer, createTexture, NullTexture, Texture } from '../../common/kingly';
import { GL } from '../../common/webgl_constants';
import { SettingsSpec, SpecType } from '../../specs';
import { onChartRendered } from '../../state/actions/chart';
import { BackwardRef, GlobalChartState } from '../../state/chart_state';
import { getA11ySettingsSelector } from '../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../state/selectors/get_chart_theme';
import { getSettingsSpecSelector } from '../../state/selectors/get_settings_spec';
import { getSpecsFromStore } from '../../state/utils';
import { Size } from '../../utils/dimensions';
import { PlotMatrixStyle } from '../../utils/themes/theme';
import { domainToUnitScale, unitToColorScale } from './plom/dom/d3utils';
import { renderPlom } from './plom/dom/plom';
import { sampleData as dimensions } from './plom/lib/sample_data';
import { c, DARK_MODE, OUTER_HEIGHT, OUTER_WIDTH } from './plom/src/config';
import { PlotMatrixSpec } from './plot_matrix_api';
import { ensureWebgl } from './render/ensure_webgl';
import { GLResources, NULL_GL_RESOURCES, nullPlotMatrixViewModel } from './types';

const PALETTE_LENGTH = 256;
const PALETTE_MAX_INDEX = PALETTE_LENGTH - 1;

const makePalette = (unitValueToColor: (n: number) => [number, number, number], alpha: number) =>
  [...new Array(PALETTE_LENGTH)].map((_, i) => [...unitValueToColor(i / PALETTE_MAX_INDEX), alpha]);

const colorPalette: [number, [number, number, number]][] = [...c.palettes.turbo]
  .reverse()
  .map(([r, g, b], i) => [i / 255, [r, g, b]]);
const paletteData = makePalette(unitToColorScale(colorPalette), PALETTE_MAX_INDEX);

/** Get the config: todo get it via normal data flow in the future */

const lineValues = dimensions.find((d: any) => d.label === 'CRC')!.values;

const visibleDimensions = new Set([
  'Block count',
  'Block size',
  'Total size',
  'Total cost',
  'Excess charge',
  'Bandwidth',
  'Payload',
]);

const downPushOfParcoords = c.parcoordsY;

const layoutCombined = {
  margin: { t: 20 + downPushOfParcoords, r: 20, b: 60 - downPushOfParcoords, l: 130 + c.parcoordsX },
  visibleDimensions,
};

const baseConfig = {
  colorPalette: [...c.palettes.turbo].reverse().map(([r, g, b], i) => [i / 255, `rgb(${r},${g},${b})`]),
  heatmapPalette: c.palettes.magma.map(([r, g, b], i) => [i / 255, `rgb(${r},${g},${b})`]),
  lineColor: lineValues,
  domain: { x: [0, 1], y: [0, 1] },
  line: {
    color: lineValues.map(domainToUnitScale(lineValues)),
    colorValueMin: lineValues.reduce((p, n) => Math.min(p, n), Infinity),
    colorValueMax: lineValues.reduce((p, n) => Math.max(p, n), -Infinity),
  },
};

const configs = [{ ...baseConfig, layout: layoutCombined, dimensions }].map((config: any) => ({
  ...config,
  canvasWidth: OUTER_WIDTH,
  canvasHeight: OUTER_HEIGHT,
  screenDimensions: {
    width: OUTER_WIDTH - config.layout.margin.l - config.layout.margin.r,
    height: OUTER_HEIGHT - config.layout.margin.t - config.layout.margin.b,
    margin: config.layout.margin,
    dpr: c.dpr,
    visibleDimensions: config.layout.visibleDimensions,
  },
}));

const eventCallback = (event: unknown, data: { datumIndex: number }) =>
  c.eventDebug && data?.datumIndex && console.log('Event:', event, data.datumIndex);

interface StateProps {
  theme: PlotMatrixStyle;
  plotMatrixViewModel: PlotMatrixSpec['columnarData'];
  chartDimensions: Size;
  a11ySettings: ReturnType<typeof getA11ySettingsSelector>;
  onElementOver: NonNullable<SettingsSpec['onElementOver']>;
  onElementClick: NonNullable<SettingsSpec['onElementClick']>;
  onElementOut: NonNullable<SettingsSpec['onElementOut']>;
  onRenderChange: NonNullable<SettingsSpec['onRenderChange']>;
  forwardStageRef2: RefObject<SVGSVGElement>;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  containerRef: BackwardRef;
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type PlotMatrixProps = StateProps & DispatchProps & OwnProps;

class PlotMatrixComponent extends React.Component<PlotMatrixProps> {
  static displayName = 'PlotMatrix';

  // DOM API Canvas2d and WebGL resources
  private glContext: WebGL2RenderingContext | null = null;
  private palette: Texture = NullTexture;
  private heatmapPalette: Texture = NullTexture;
  private pickTexture: Texture = NullTexture;
  private binningRaster1d: Texture = NullTexture;
  private binningRaster2d: Texture = NullTexture;
  private binRanges1d: Texture = NullTexture;
  private binRanges2d: Texture = NullTexture;

  private glResources: GLResources = NULL_GL_RESOURCES;
  private readonly glCanvasRef: RefObject<HTMLCanvasElement> = createRef();

  constructor(props: Readonly<PlotMatrixProps>) {
    super(props);
    const columns = this.props.plotMatrixViewModel;

    // vector length checks
    const datumCount = columns.position1.length / 2;
    if (datumCount % 1) throw new Error('plotMatrix error: position1 vector must have even values (x/y pairs)');
    if (datumCount * 2 !== columns.position0.length)
      throw new Error('plotMatrix error: Mismatch between position0 (xy) and position1 (xy) length');
    if (datumCount !== columns.size0.length)
      throw new Error('plotMatrix error: Mismatch between position1 (xy) and size0 length');
    if (datumCount !== columns.size1.length)
      throw new Error('plotMatrix error: Mismatch between position1 (xy) and size1 length');
    if (datumCount * 4 !== columns.color.length)
      throw new Error('plotMatrix error: Mismatch between position1 (xy) and color (rgba) length');
    if (datumCount !== columns.value.length)
      throw new Error('plotMatrix error: Mismatch between position1 (xy) and value length');
    if (datumCount !== columns.label.length)
      throw new Error('plotMatrix error: Mismatch between position1 (xy) and label length');
  }

  componentDidMount = () => {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    this.drawCanvas();
    this.props.onChartRendered();
  };

  private ensureTextureAndDraw = () => {
    this.ensurePickTexture();
    this.drawCanvas();
  };

  // componentDidUpdate = () => this.ensureTextureAndDraw();

  private getActiveCursor = (): CSSProperties['cursor'] => DEFAULT_CSS_CURSOR;

  render = () => {
    const {
      forwardStageRef,
      forwardStageRef2,
      chartDimensions: { width: requestedWidth, height: requestedHeight },
      a11ySettings,
    } = this.props;
    const width = requestedWidth;
    const height = requestedHeight;
    const style: CSSProperties = {
      width,
      height,
      top: 0,
      left: 0,
      padding: 0,
      margin: 0,
      border: 0,
      position: 'absolute',
      cursor: this.getActiveCursor(),
    };

    const { dpr } = c;
    const canvasWidth = width * dpr;
    const canvasHeight = height * dpr;

    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          <canvas /* WebGL2 layer */
            ref={this.glCanvasRef}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            style={{ ...style, backgroundColor: DARK_MODE ? 'black' : 'white' }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
          <canvas /* 2d canvas layer for future text or svg replacement */
            ref={forwardStageRef}
            tabIndex={0}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            style={{ ...style, outline: 'none' }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
          <svg /* svg layer */
            ref={forwardStageRef2}
            className="echCanvasRenderer"
            width={canvasWidth}
            height={canvasHeight}
            style={{ ...style, outline: 'none', fontSize: 'smaller', pointerEvents: 'none' }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
        </figure>
      </>
    );
  };

  private drawCanvas = () => {
    if (
      !this.props.forwardStageRef?.current ||
      !this.props.forwardStageRef2?.current ||
      !this.glContext ||
      !this.pickTexture
    )
      return;

    const glCanvasElement = this.props.forwardStageRef.current;
    const svgElement = this.props.forwardStageRef2.current;

    const textures = {
      palette: this.palette,
      heatmapPalette: this.heatmapPalette,
      pickTexture: this.pickTexture,
      binningRaster1d: this.binningRaster1d,
      binningRaster2d: this.binningRaster2d,
      binRanges1d: this.binRanges1d,
      binRanges2d: this.binRanges2d,
    };
    renderPlom(this.glContext, svgElement, glCanvasElement, eventCallback, configs, this.glResources, textures);

    this.props.onRenderChange(true); // emit API callback
  };

  private ensurePickTexture = () => {
    const { width, height } = this.props.chartDimensions;
    const pr = c.dpr;
    const textureWidth = pr * width;
    const textureHeight = pr * height;
    const current = this.pickTexture;
    const gl = this.glContext;
    const { dpr } = c;
    const dimensionCount = 7; // todo fix this
    const binningRasterRowCount = dimensionCount;
    const binningRasterColumnCount = dimensionCount;

    if (gl && (current === NullTexture || current.width !== textureWidth || current.height !== textureHeight)) {
      // (re)create texture
      current.delete();
      this.palette =
        createTexture(gl, {
          textureIndex: 0,
          width: PALETTE_LENGTH,
          height: 1,
          internalFormat: GL.RGBA8,
          data: new Uint8Array(paletteData.flat()),
        }) ?? NullTexture;
      this.heatmapPalette =
        createTexture(gl, {
          textureIndex: 1,
          width: PALETTE_LENGTH,
          height: 1,
          internalFormat: GL.RGBA8,
          data: new Uint8Array(c.palettes.magma.flat()),
        }) ?? NullTexture;
      this.binningRaster1d =
        createTexture(gl, {
          textureIndex: 2,
          width: c.binCountX * binningRasterColumnCount,
          height: binningRasterRowCount,
          internalFormat: GL.RGBA32F,
          data: null,
        }) ?? NullTexture;
      this.binningRaster2d =
        createTexture(gl, {
          textureIndex: 3,
          width: c.binCountX * binningRasterColumnCount,
          height: c.binCountY * binningRasterRowCount,
          internalFormat: GL.RGBA32F,
          min: c.kernelDensity ? GL.LINEAR : GL.NEAREST,
          mag: c.kernelDensity ? GL.LINEAR : GL.NEAREST,
          data: null,
        }) ?? NullTexture;
      this.binRanges1d =
        createTexture(gl, {
          textureIndex: 4,
          width: binningRasterColumnCount,
          height: binningRasterRowCount,
          internalFormat: GL.RGBA32F,
          data: null,
        }) ?? NullTexture;
      this.binRanges2d =
        createTexture(gl, {
          textureIndex: 5,
          width: binningRasterColumnCount,
          height: binningRasterRowCount,
          internalFormat: GL.RGBA32F,
          data: null,
        }) ?? NullTexture;
      this.pickTexture =
        createTexture(gl, {
          textureIndex: 6,
          width: Math.ceil(dpr * outerWidth),
          height: Math.ceil(dpr * outerHeight),
          internalFormat: GL.RGBA8,
          data: null,
        }) ?? NullTexture;

      bindFramebuffer(gl, GL.READ_FRAMEBUFFER, this.pickTexture.target());
    }
  };

  private initializeGL = (gl: WebGL2RenderingContext) => {
    this.glResources = ensureWebgl(
      gl,
      this.pickTexture,
      this.binningRaster1d,
      this.binningRaster2d,
      this.binRanges1d,
      this.binRanges2d,
    );
  };

  private restoreGL = (gl: WebGL2RenderingContext) => {
    this.initializeGL(gl);
    this.pickTexture = NullTexture;
    this.ensureTextureAndDraw();
  };

  private tryCanvasContext = () => {
    const glCanvas = this.glCanvasRef.current;

    this.glContext = glCanvas && glCanvas.getContext('webgl2');

    this.ensurePickTexture();

    if (glCanvas && this.glContext && this.glResources === NULL_GL_RESOURCES) {
      glCanvas.addEventListener('webglcontextlost', this.contextLossHandler, false);
      glCanvas.addEventListener('webglcontextrestored', this.contextRestoreHandler, false);

      this.initializeGL(this.glContext);
      // testContextLoss(this.glContext);
    }
  };

  private contextLossHandler = (event: { preventDefault: () => void }) => {
    // we could log it for telemetry etc todo add the option for a callback
    event.preventDefault(); // this is needed for the context restoration callback to happen
  };

  private contextRestoreHandler = () => {
    // browser trivia: the duplicate calling of ensureContextAndInitialRender and changing/resetting the width are needed for Chrome and Safari to properly restore the context upon loss
    // we could log context loss/regain for telemetry etc todo add the option for a callback
    const glCanvas = this.glCanvasRef.current;
    if (!glCanvas || !this.glContext) return;
    this.restoreGL(this.glContext);
    const widthCss = glCanvas.style.width;
    const widthNum = parseFloat(widthCss);
    glCanvas.style.width = `${widthNum + 0.1}px`;
    window.setTimeout(() => {
      glCanvas.style.width = widthCss;
      if (this.glContext) this.restoreGL(this.glContext);
    }, 0);
  };
}

const mapStateToProps = (state: GlobalChartState): StateProps => {
  const Spec = getSpecsFromStore<PlotMatrixSpec>(state.specs, ChartType.PlotMatrix, SpecType.Series)[0];
  const settingsSpec = getSettingsSpecSelector(state);
  return {
    theme: getChartThemeSelector(state).plotMatrix,
    plotMatrixViewModel: Spec?.columnarData ?? nullPlotMatrixViewModel,
    chartDimensions: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),

    // mandatory charts API protocol; todo extract these mappings as now there are multiple charts like this
    onElementOver: settingsSpec.onElementOver ?? (() => {}),
    onElementClick: settingsSpec.onElementClick ?? (() => {}),
    onElementOut: settingsSpec.onElementOut ?? (() => {}),
    onRenderChange: settingsSpec.onRenderChange ?? (() => {}), // todo eventually also update data props on a local .echChartStatus element: data-ech-render-complete={rendered} data-ech-render-count={renderedCount} data-ech-debug-state={debugStateString}

    forwardStageRef2: React.createRef(),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => bindActionCreators({ onChartRendered }, dispatch);

const PlotMatrixLayers = connect(mapStateToProps, mapDispatchToProps)(PlotMatrixComponent);

/** @internal */
export const PlotMatrix = (containerRef: BackwardRef, forwardStageRef: RefObject<HTMLCanvasElement>) => (
  <PlotMatrixLayers forwardStageRef={forwardStageRef} containerRef={containerRef} />
);
