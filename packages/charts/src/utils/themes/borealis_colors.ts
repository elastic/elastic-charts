/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EUI_DARK, EUI_LIGHT } from './eui_borealis_colors.generated';
import type { Color } from '../../common/colors';

/**
 * @internal
 */
export const BOREALIS_LIGHT_COLORS_PALETTE: Color[] = [...EUI_LIGHT.vis];

/**
 * @internal
 */
export const BOREALIS_LIGHT_DEFAULT_VIS_COLOR: Color = EUI_LIGHT.vis[0];

/**
 * @internal
 */
export const BOREALIS_DARK_COLORS_PALETTE: Color[] = [...EUI_DARK.vis];

/**
 * @internal
 */
export const BOREALIS_DARK_DEFAULT_VIS_COLOR: Color = EUI_DARK.vis[0];
