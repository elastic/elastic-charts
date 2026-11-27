/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// Everything of the main entry too: in Node the headless entry is a copy of Charts of its own, bound to a
// stand-in for React, and it renders only charts made of its own components
export * from '..';
export { renderChart } from './render_chart';
