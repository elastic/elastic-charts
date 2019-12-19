import { Dimensions } from '../../../../utils/dimensions';
import { shapeViewModel } from '../../layout/viewModel/viewmodel';
import { measureText } from '../../layout/utils/measure';
import { ShapeTreeNode, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { Theme } from '../../../../utils/themes/theme';
import { depthKey } from '../../layout/utils/group_by_rollup';
import { PartitionSpec } from '../../specs/index';

const identity = (d: any) => d;

export function render(partitionSpec: PartitionSpec, parentDimensions: Dimensions, theme: Theme): ShapeViewModel {
  const { width, height } = parentDimensions;
  // eslint-disable-next-line no-console
  console.log(theme);
  const facts = partitionSpec.data;
  const textMeasurer = document.createElement('canvas');
  const textMeasurerCtx = textMeasurer.getContext('2d');
  const myConfig = { ...partitionSpec.config, width, height };
  const layers = partitionSpec.layers;
  const viewModel =
    textMeasurerCtx &&
    shapeViewModel(
      measureText(textMeasurerCtx),
      myConfig,
      layers,
      facts,
      (node: ShapeTreeNode) => (layers[node[depthKey] - 1].nodeLabel || identity)(node.data.name),
      partitionSpec.valueAccessor,
      partitionSpec.valueFormatter,
      [() => null, ...layers.map(({ groupByRollup }) => groupByRollup)],
    );
  const sectorViewModel = viewModel ? viewModel.quadViewModel : [];
  const rowSets = viewModel ? viewModel.rowSets : [];
  const linkLabelViewModels = viewModel ? viewModel.linkLabelViewModels : [];
  const outsideLinksViewModel = viewModel ? viewModel.outsideLinksViewModel : [];
  const diskCenter = viewModel ? viewModel.diskCenter : { x: width / 2, y: height / 2 };
  return {
    config: myConfig,
    quadViewModel: sectorViewModel,
    rowSets,
    linkLabelViewModels,
    outsideLinksViewModel,
    diskCenter,
  };
}
