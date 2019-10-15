import { SpecActions } from './specs';
import { ChartActions } from './chart';
import { ChartSettingsActions } from './chart_settings';
import { CursorActions } from './cursor';
import { LegendActions } from './legend';

export type StateActions = SpecActions | ChartActions | ChartSettingsActions | CursorActions | LegendActions;
