/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import { Geometries } from '../../state/utils/types';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';

/** @internal */
export interface ReactiveDataTableProps {
  isChartEmpty: boolean;
  dataTableGeometries: Geometries;
  geometriesIndex: IndexedGeometryMap;
}

class XYDataTableComponent extends React.Component<ReactiveDataTableProps> {
  static displayName = 'text alternative data table';

  getKey = (data: Geometries) => {
    const entries = Object.values(data);

    return entries
      .filter((a) => a.length !== 0)[0][0]
      .value.map((value: any) => {
        return Object.entries(value.value.datum).map((val) => {
          return (
            <button type="button" key={Math.random()} aria-label={`value ${val[0]} amount ${val[1]}`}>
              {`${val[0]}: ${val[1]}`}
            </button>
          );
        });
      });
  };

  // getValue(data: Geometries) {
  //   const entries = Object.values(data);

  //   return entries
  //     .filter((a) => a.length !== 0)[0][0]
  //     .value.map((value: any) => {
  //       return Object.entries(value.value.datum).map((val) => {
  //         return val[1];
  //       });
  //     });
  // }

  render() {
    const { dataTableGeometries } = this.props;
    const classNames = 'screen-reader echChart';
    return <div className={classNames}>{this.getKey(dataTableGeometries)}</div>;
  }
}

/** @internal */
export const XYDataTable = XYDataTableComponent;
