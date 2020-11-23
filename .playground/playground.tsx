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

interface Food {
  label: string;
  count: number;
}

type Foods = Array<Food>;

export class Playground extends React.Component {
  foods: Foods = [
    { label: 'pie', count: 2 },
    { label: 'asparagus', count: 15 },
    { label: 'brownies', count: 0 },
    { label: 'popsicles', count: 3 },
  ];

  getFoodNumber = (foodLabel: Food[keyof Food]) => {
    return this.foods.map(({ label, count }) => {
      if (foodLabel === label) {
        let i: number = 0;
        while (i < count) {
          console.log(label);
          // return `there are ${this.foods[index].count} ${foodLabel}`;
          i++;
        }
      }
    });
  };

  makingFood = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  getNumberOfFood = (food: any) => {
    return this.makingFood(1000).then(() => this.getFoodNumber(food));
  };

  render() {
    return (
      <>
        <div className="page" style={{ width: 5000, height: 5000, backgroundColor: 'yellow' }}>
          <div id="root" style={{ backgroundColor: 'blueviolet' }}>
            <div>
              {console.log(
                this.foods.map((_, index) =>
                  this.getNumberOfFood(this.foods[index].label).then((resolve) => {
                    console.log(resolve.filter((i) => i !== undefined));
                  }),
                ),
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
