/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export default {
  title: 'Trace (@alpha)',
};

export { Example as emptyTrace } from './00_empty.story';
export { Example as selfTimeDebug } from './02_self_time_debug.story';
export { Example as geometryDebug } from './03_geometry_debug.story';
export { Example as timeBar } from './04_time_bar.story';
export { Example as renderer } from './05_renderer.story';
export { Example as interactive } from './06_interactive.story';
export { Example as tooltipEvents } from './07_tooltip_events.story';
export { Example as multiTrace } from './08_multi_trace.story';
export { Example as largeN } from './09_large_n.story';
export { Example as colorBy } from './10_color_by.story';
export { Example as chromeNetwork } from './11_chrome_network.story';
export { Example as kibanaTrace } from './12_kibana_trace.story';
export { Example as segmentPhases } from './13_segment_phases.story';
