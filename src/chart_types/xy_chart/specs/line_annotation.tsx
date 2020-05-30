/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { createRef, CSSProperties, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ChartTypes } from '../..';
import { Spec, SpecTypes } from '../../../specs';
import { upsertSpec as upsertSpecAction, removeSpec as removeSpecAction } from '../../../state/actions/specs';
import { DEFAULT_ANNOTATION_LINE_STYLE, mergeWithDefaultAnnotationLine } from '../../../utils/themes/theme';
import { LineAnnotationSpec, DEFAULT_GLOBAL_ID, AnnotationTypes } from '../utils/specs';

type InjectedProps = LineAnnotationSpec &
  DispatchProps &
  Readonly<{
    children?: React.ReactNode;
  }>;

/** @internal */
export class LineAnnotationSpecComponent extends Component<LineAnnotationSpec> {
  static defaultProps: Partial<LineAnnotationSpec> = {
    chartType: ChartTypes.XYAxis,
    specType: SpecTypes.Annotation,
    groupId: DEFAULT_GLOBAL_ID,
    annotationType: AnnotationTypes.Line,
    style: DEFAULT_ANNOTATION_LINE_STYLE,
    hideLines: false,
    hideTooltips: false,
    hideLinesTooltips: true,
    zIndex: 1,
  };

  private markerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    const { children, upsertSpec, removeSpec, ...config } = this.props as InjectedProps;
    if (this.markerRef.current) {
      const { offsetWidth, offsetHeight } = this.markerRef.current;
      config.markerDimensions = {
        width: offsetWidth,
        height: offsetHeight,
      };
    }
    const style = mergeWithDefaultAnnotationLine(config.style);
    const spec = { ...config, style };
    upsertSpec(spec);
  }

  componentDidUpdate() {
    const { upsertSpec, removeSpec, children, ...config } = this.props as InjectedProps;
    if (this.markerRef.current) {
      const { offsetWidth, offsetHeight } = this.markerRef.current;
      config.markerDimensions = {
        width: offsetWidth,
        height: offsetHeight,
      };
    }
    const style = mergeWithDefaultAnnotationLine(config.style);
    const spec = { ...config, style };
    upsertSpec(spec);
  }

  componentWillUnmount() {
    const { removeSpec, id } = this.props as InjectedProps;
    removeSpec(id);
  }

  render() {
    if (!this.props.marker) {
      return null;
    }

    /*
     * We need to get the width & height of the marker passed into the spec
     * so we render the marker offscreen if one has been defined & update the config
     * with the width & height.
     */
    const offscreenStyle: CSSProperties = {
      position: 'absolute',
      left: -9999,
      opacity: 0,
    };

    return (
      <div ref={this.markerRef} style={{ ...offscreenStyle }}>
        {this.props.marker}
      </div>
    );
  }
}

interface DispatchProps {
  upsertSpec: (spec: Spec) => void;
  removeSpec: (id: string) => void;
}
const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      upsertSpec: upsertSpecAction,
      removeSpec: removeSpecAction,
    },
    dispatch,
  );

type SpecRequiredProps = Pick<LineAnnotationSpec, 'id' | 'dataValues' | 'domainType'>;
type SpecOptionalProps = Partial<
  Omit<
    LineAnnotationSpec,
    'chartType' | 'specType' | 'seriesType' | 'id' | 'dataValues' | 'domainType' | 'annotationType'
  >
>;

export const LineAnnotation: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = connect<
  null,
  DispatchProps,
  LineAnnotationSpec
>(
  null,
  mapDispatchToProps,
)(LineAnnotationSpecComponent);
