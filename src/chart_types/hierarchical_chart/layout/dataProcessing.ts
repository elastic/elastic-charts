import { DimensionName, ElasticsearchRowResponse, MasterDataValues, Relation } from './circline/types/Types';
import { SectorTreeNode } from './circline/types/ViewModelTypes';
import { depthKey } from './circline/utils/groupBy';
import { ViewQuery } from './circline/types/ConfigTypes';
import { dimensions } from './mocks/dimensionCodes';

export const rawTextGetterFn = (lookup: MasterDataValues) => (node: SectorTreeNode) => {
  const zeroBasedLevel = node[depthKey] - 1;
  const nameObject = lookup[zeroBasedLevel][node.data.name];
  return nameObject ? nameObject.name : '';
};

export const rawValueGetterFn = (/*lookup: MasterDataValues*/) => (node: SectorTreeNode) => node.value;

// this repo queries ES directly (array of row arrays response);
// converted to `elastic-charts` array of row objects here
export const toObjects = (response: ElasticsearchRowResponse): Relation =>
  response.rows.map((row) => Object.assign({}, ...response.columns.map(({ name }, i: number) => ({ [name]: row[i] }))));

export const dimensionValues = (viewQuery: ViewQuery) =>
  viewQuery.dimensions.map((dim: DimensionName) => dimensions[dim]);
