/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { updateDevicePixelRatio } from '../state/actions/chart_settings';

interface DispatchProps {
  updateDevicePixelRatio: typeof updateDevicePixelRatio;
}

type Props = DispatchProps;

class DPRObserver extends React.Component<Props> {
  componentDidMount() {
    this.#setupListener();
  }

  #setupListener() {
    window
      .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      .addEventListener('change', this.#onDPRChange, { once: true });
  }

  #onDPRChange = () => {
    this.props.updateDevicePixelRatio(window.devicePixelRatio);
    this.#setupListener();
  };

  render() {
    return null;
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators({ updateDevicePixelRatio }, dispatch);

/** @internal */
export const ChartDPRObserver = connect(null, mapDispatchToProps)(DPRObserver);
