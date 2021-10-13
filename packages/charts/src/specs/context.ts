/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createContext, useContext } from 'react';

import { SettingsProps } from './settings';

/** @internal */
export interface EchContext {
  settings?: SettingsProps;
}
const ElasticChartsContext = createContext<EchContext>({});

/**
 * Context used to control elastic chart options globally
 * @public
 */
export const ElasticChartsProvider = ElasticChartsContext.Provider;

/** @internal */
export const useChartsContext = () => useContext(ElasticChartsContext);
