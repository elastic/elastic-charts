import { Dimensions } from '../../../../utils/dimensions';
import { shapeViewModel } from '../../layout/circline/viewModel/viewModel';
import { measureText } from '../../layout/circline/utils/measure';
import { SectorTreeNode, ShapeViewModel } from '../../layout/circline/types/ViewModelTypes';
import { Theme } from '../../../../utils/themes/theme';
import { depthKey } from '../../layout/circline/utils/groupByRollup';
import { SunburstSpec } from '../../specs/index';

export function render(sunburstSpec: SunburstSpec, parentDimensions: Dimensions, theme: Theme): ShapeViewModel {
  const { width, height } = parentDimensions;
  // eslint-disable-next-line no-console
  console.log(theme);
  const facts = sunburstSpec.data;
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  const myConfig = { ...sunburstSpec.config, width, height };
  const layers = sunburstSpec.layers;
  const viewModel =
    textMeasurerCtx &&
    shapeViewModel(
      measureText(textMeasurerCtx),
      myConfig,
      facts,
      (node: SectorTreeNode) => layers[node[depthKey] - 1].nodeLabel(node.data.name),
      sunburstSpec.valueAccessor,
      sunburstSpec.valueFormatter,
      [() => null, ...layers.map(({ groupByRollup }) => groupByRollup)],
    );
  const sectorViewModel = viewModel ? viewModel.sectorViewModel : [];
  const rowSets = viewModel ? viewModel.rowSets : [];
  const linkLabelViewModels = viewModel ? viewModel.linkLabelViewModels : [];
  const outsideLinksViewModel = viewModel ? viewModel.outsideLinksViewModel : [];
  const diskCenter = viewModel ? viewModel.diskCenter : { x: width / 2, y: height / 2 };
  return { config: myConfig, sectorViewModel, rowSets, linkLabelViewModels, outsideLinksViewModel, diskCenter };
}
