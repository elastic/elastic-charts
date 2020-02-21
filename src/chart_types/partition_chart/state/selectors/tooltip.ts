import createCachedSelector from 're-reselect';
import { GlobalChartState } from '../../../../state/chart_state';
import { partitionGeometries } from './geometries';
import { INPUT_KEY } from '../../layout/utils/group_by_rollup';
import { QuadViewModel } from '../../layout/types/viewmodel_types';
import { TooltipInfo } from '../../../../components/tooltip/types';
import { ChartTypes } from '../../..';
import { SpecTypes } from '../../../../specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { PartitionSpec } from '../../specs';

const getCurrentPointerPosition = (state: GlobalChartState) => state.interactions.pointer.current.position;

const getValueFormatter = (state: GlobalChartState) => {
  const pieSpecs = getSpecsFromStore<PartitionSpec>(state.specs, ChartTypes.Partition, SpecTypes.Series);
  return pieSpecs[0].valueFormatter;
};

const getLabelFormatters = (state: GlobalChartState) => {
  const pieSpecs = getSpecsFromStore<PartitionSpec>(state.specs, ChartTypes.Partition, SpecTypes.Series);
  return pieSpecs[0].layers;
};
export const getTooltipInfoSelector = createCachedSelector(
  [partitionGeometries, getCurrentPointerPosition, getValueFormatter, getLabelFormatters],
  (geoms, pointerPosition, valueFormatter, labelFormatters): TooltipInfo => {
    const picker = geoms.pickQuads;
    const diskCenter = geoms.diskCenter;
    const x = pointerPosition.x - diskCenter.x;
    const y = pointerPosition.y - diskCenter.y;
    const pickedShapes: Array<QuadViewModel> = picker(x, y);
    const datumIndices = new Set();
    const tooltipInfo: TooltipInfo = {
      header: null,
      values: [],
    };
    pickedShapes.forEach((shape, i) => {
      const node = shape.parent;
      const formatter = labelFormatters[shape.depth - 1] && labelFormatters[shape.depth - 1].nodeLabel;

      tooltipInfo.values.push({
        label: formatter ? formatter(shape.dataName) : shape.dataName,
        color: shape.fillColor,
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
          specId: '1',
          key: `${i}`,
        },
        value: valueFormatter(shape.value),
        valueAccessor: 'a',
      });
      const shapeNode = node.children.find(([key]) => key === shape.dataName);
      if (shapeNode) {
        const indices = shapeNode[1][INPUT_KEY] || [];
        indices.forEach((i) => datumIndices.add(i));
      }
    });

    return tooltipInfo;
  },
)((state) => state.chartId);
