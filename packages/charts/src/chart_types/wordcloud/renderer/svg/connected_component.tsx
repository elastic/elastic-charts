/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import d3TagCloud from 'd3-cloud';
import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { ScreenReaderSummary } from '../../../../components/accessibility';
import type { SettingsSpec, WordCloudElementEvent } from '../../../../specs/settings';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getInternalChartStateSelector } from '../../../../state/selectors/get_internal_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { Size } from '../../../../utils/dimensions';
import type { ShapeViewModel, Word, WordcloudViewModel } from '../../layout/types/viewmodel_types';
import { nullShapeViewModel } from '../../layout/types/viewmodel_types';
import { geometries } from '../../state/selectors/geometries';

function getFont(d: Word) {
  return d.fontFamily;
}

function getFontStyle(d: Word) {
  return d.style;
}

function getFontWeight(d: Word) {
  return d.fontWeight;
}

function getFontSize(d: Word) {
  return d.size;
}

function hashWithinRange(str: string, max: number) {
  str = JSON.stringify(str);
  let hash = 0;
  for (const ch of str) {
    hash = (hash * 31 + ch.charCodeAt(0)) % max;
  }
  return Math.abs(hash) % max;
}

function getRotation(startAngle: number, endAngle: number, count: number, text: string) {
  const angleRange = endAngle - startAngle;
  const angleCount = count ?? 360;
  const interval = count - 1;
  const angleStep = interval === 0 ? 0 : angleRange / interval;
  const index = hashWithinRange(text, angleCount);
  return index * angleStep + startAngle;
}

function exponential(minFontSize: number, maxFontSize: number, exponent: number, weight: number) {
  return minFontSize + (maxFontSize - minFontSize) * weight ** exponent;
}

function linear(minFontSize: number, maxFontSize: number, _exponent: number, weight: number) {
  return minFontSize + (maxFontSize - minFontSize) * weight;
}

function squareRoot(minFontSize: number, maxFontSize: number, _exponent: number, weight: number) {
  return minFontSize + (maxFontSize - minFontSize) * Math.sqrt(weight);
}

function log(minFontSize: number, maxFontSize: number, _exponent: number, weight: number) {
  return minFontSize + (maxFontSize - minFontSize) * Math.log2(weight + 1);
}

const weightFnLookup = { linear, exponential, log, squareRoot };

function layoutMaker({ data, ...viewModel }: WordcloudViewModel, chartSize: Size) {
  const { height, width } = chartSize;
  const words = data.map<Word>((d) => {
    const weightFn = weightFnLookup[viewModel.weightFn];
    return {
      datum: d,
      text: d.text,
      color: d.color,
      fontFamily: viewModel.fontFamily,
      style: viewModel.fontStyle,
      fontWeight: viewModel.fontWeight,
      size: weightFn(viewModel.minFontSize, viewModel.maxFontSize, viewModel.exponent, d.weight),
    };
  });

  return d3TagCloud<Word>()
    .random(() => 0.5)
    .size([width, height])
    .words(words)
    .spiral(viewModel.spiral ?? 'archimedean')
    .padding(viewModel.padding ?? 5)
    .rotate((d) => getRotation(viewModel.startAngle, viewModel.endAngle, viewModel.angleCount, d.text))
    .font(getFont)
    .fontStyle(getFontStyle)
    .fontWeight(getFontWeight)
    .fontSize(getFontSize);
}

const View = ({
  words,
  size: { height, width },
  actions: { onElementClick, onElementOver, onElementOut },
  specId,
}: {
  words: Word[];
  size: Size;
  actions: {
    onElementClick?: SettingsSpec['onElementClick'];
    onElementOver?: SettingsSpec['onElementOver'];
    onElementOut?: SettingsSpec['onElementOut'];
  };
  specId: string;
}) => {
  return (
    <svg width={width} height={height} role="presentation">
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {words.map((d, i) => {
          const elements: WordCloudElementEvent[] = [[d.datum, { specId, key: specId }]];
          const actions = {
            ...(onElementClick && {
              onClick: () => {
                onElementClick(elements);
              },
            }),
            ...(onElementOver && {
              onMouseOver: () => {
                onElementOver(elements);
              },
            }),
            ...(onElementOut && {
              onMouseOut: () => {
                onElementOut();
              },
            }),
          };
          return (
            <text
              key={String(i)}
              style={{
                fontSize: getFontSize(d),
                fontStyle: getFontStyle(d),
                fontFamily: getFont(d),
                fontWeight: getFontWeight(d),
                fill: d.color,
              }}
              textAnchor="middle"
              transform={`translate(${d.x}, ${d.y}) rotate(${d.rotate})`}
              {...actions}
            >
              {d.text}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

interface ReactiveChartStateProps {
  initialized: boolean;
  geometries: ShapeViewModel;
  chartSize: Size;
  a11ySettings: A11ySettings;
  onElementClick?: SettingsSpec['onElementClick'];
  onElementOver?: SettingsSpec['onElementOver'];
  onElementOut?: SettingsSpec['onElementOut'];
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps;

class Component extends React.Component<Props> {
  static displayName = 'Wordcloud';

  componentDidMount() {
    if (this.props.initialized) {
      this.props.onChartRendered();
    }
  }

  componentDidUpdate() {
    if (this.props.initialized) {
      this.props.onChartRendered();
    }
  }

  render() {
    const {
      initialized,
      chartSize,
      geometries: { wordcloudViewModel, specId },
      a11ySettings,
      onElementClick,
      onElementOver,
      onElementOut,
    } = this.props;

    if (!initialized || chartSize.width === 0 || chartSize.height === 0) {
      return null;
    }

    const layout = layoutMaker(wordcloudViewModel, chartSize);

    let renderedWordObjects: Word[] = [];
    layout.on('end', (w) => (renderedWordObjects = w)).start();

    const wordCount = wordcloudViewModel.data.length;
    const renderedWordCount: number = renderedWordObjects.length;
    const notAllWordsFit = wordCount !== renderedWordCount;
    if (notAllWordsFit && wordcloudViewModel.outOfRoomCallback instanceof Function) {
      wordcloudViewModel.outOfRoomCallback(
        wordCount,
        renderedWordCount,
        renderedWordObjects.map((word) => word.text),
      );
    }

    return (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <View
          words={renderedWordObjects}
          size={chartSize}
          actions={{ onElementClick, onElementOut, onElementOver }}
          specId={specId}
        />
        <ScreenReaderSummary />
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
  chartSize: {
    width: 0,
    height: 0,
  },
  a11ySettings: DEFAULT_A11Y_SETTINGS,
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  const internalChartState = getInternalChartStateSelector(state);
  if (getInternalIsInitializedSelector(state, internalChartState) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    geometries: geometries(state),
    chartSize: state.parentDimensions,
    a11ySettings: getA11ySettingsSelector(state),
    onElementClick: getSettingsSpecSelector(state).onElementClick,
    onElementOver: getSettingsSpecSelector(state).onElementOver,
    onElementOut: getSettingsSpecSelector(state).onElementOut,
  };
};

/** @internal */
export const Wordcloud = connect(mapStateToProps, mapDispatchToProps)(Component);
