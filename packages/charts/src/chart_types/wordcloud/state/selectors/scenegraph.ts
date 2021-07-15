/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { mergePartial, RecursivePartial } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { config as defaultConfig } from '../../layout/config/config';
import { Config } from '../../layout/types/config_types';
import { ShapeViewModel } from '../../layout/types/viewmodel_types';
import { shapeViewModel } from '../../layout/viewmodel/viewmodel';
import { WordcloudSpec } from '../../specs';

/** @internal */
export function render(spec: WordcloudSpec, parentDimensions: Dimensions): ShapeViewModel {
  const { width, height } = parentDimensions;
  const { config } = spec;
  const partialConfig: RecursivePartial<Config> = { ...config, width, height };
  const cfg: Config = mergePartial(defaultConfig, partialConfig, { mergeOptionalPartialValues: true });
  return shapeViewModel(spec, cfg);
}
