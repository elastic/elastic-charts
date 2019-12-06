import { SunburstSpec } from '../../specs/sunburst_spec';
import { Dimensions } from '../../../../utils/dimensions';
import { shapeViewModel } from '../../layout/circline/viewModel/viewModel';
import { measureText } from '../../layout/circline/utils/measure';
import { dimensionValues, rawTextGetterFn, rawValueGetterFn } from '../../layout/dataProcessing';
import { ShapeViewModel } from '../../layout/circline/types/ViewModelTypes';
import { Theme } from '../../../../utils/themes/theme';

export function render(sunburstSpec: SunburstSpec, parentDimensions: Dimensions, theme: Theme): ShapeViewModel {
  const { width, height } = parentDimensions;
  // eslint-disable-next-line no-console
  console.log(theme);
  const facts = sunburstSpec.data;
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  const myConfig = { ...sunburstSpec.config, width, height };
  const viewModel =
    textMeasurerCtx &&
    shapeViewModel(
      measureText(textMeasurerCtx),
      myConfig,
      facts,
      rawTextGetterFn(dimensionValues(myConfig.viewQuery)),
      rawValueGetterFn(/*dimensionValues(myConfig.viewQuery)*/),
    );
  const sectorViewModel = viewModel ? viewModel.sectorViewModel : [];
  const rowSets = viewModel ? viewModel.rowSets : [];
  const linkLabelViewModels = viewModel ? viewModel.linkLabelViewModels : [];
  const outsideLinksViewModel = viewModel ? viewModel.outsideLinksViewModel : [];
  const diskCenter = viewModel ? viewModel.diskCenter : { x: width / 2, y: height / 2 };
  return { config: myConfig, sectorViewModel, rowSets, linkLabelViewModels, outsideLinksViewModel, diskCenter };
}
