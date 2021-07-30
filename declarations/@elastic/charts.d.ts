/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/*
 * This file is required to point at src types when using workspaces inside other workspaces.
 * Without this the types will point at node_modules which may not be correct version.
 */

export * from '../../packages/charts/src';
