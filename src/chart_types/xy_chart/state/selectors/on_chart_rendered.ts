import { GlobalChartState } from '../../../../state/chart_state';

export function createOnChartRenderedCalled(): (
  state: GlobalChartState,
) => {
  renderComplete: boolean;
  renderCount: number;
} {
  let wasRendered = false;
  let counter = 0;
  return (
    state: GlobalChartState,
  ): {
    renderComplete: boolean;
    renderCount: number;
  } => {
    if (state.initialized && state.legendRendered && !wasRendered) {
      counter = counter + 1;
      wasRendered = true;
      return {
        renderComplete: true,
        renderCount: counter,
      };
    }
    if (!state.initialized || !state.legendRendered) {
      wasRendered = false;
    }
    return {
      renderComplete: wasRendered,
      renderCount: counter,
    };
  };
}
