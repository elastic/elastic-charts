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
  actionLabel: string;
}

type Foods = Array<Food>;

type FoodArray = Array<string>;

export class Playground extends React.Component {
  foods: Foods = [
    { label: 'pie', count: 2, actionLabel: 'tab' },
    { label: 'asparagus', count: 5, actionLabel: 'tab' },
    { label: 'brownies', count: 0, actionLabel: 'enter' },
    { label: 'popsicles', count: 3, actionLabel: 'enter' },
  ];

  foodsAsAnArray: FoodArray = ['tab', 'tab', 'tab', 'enter'];

  getFoodsArrayAction = (foodsArray: FoodArray) => {
    for (let i = 0; i < foodsArray.length; i++) {
      if (foodsArray[i] === 'tab') {
        // alert('tab!');
      } else if (foodsArray[i] === 'enter') {
        // alert('enter!');
      }
    }
  };

  getFoodAction = (foodLabel: Food[keyof Food]) => {
    // eslint-disable-next-line array-callback-return
    return this.foods.map(({ label, count, actionLabel }) => {
      if (foodLabel === label && actionLabel === 'tab') {
        let c = 0;
        while (c < count) {
          // alert(`${label} Tab!`);
          c++;
        }
      } else if (foodLabel === label && actionLabel === 'enter') {
        let c = 0;
        while (c < count) {
          // alert(`${label} Enter!`);
          c++;
        }
      }
    });
  };

  makingFood = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  getNumberOfFood = (food: any) => {
    return this.makingFood(1000).then(() => this.getFoodAction(food));
  };

  getNumberOfFoodArray = () => {
    return this.makingFood(1000).then(() => this.getFoodsArrayAction(this.foodsAsAnArray));
  };

  getAsyncNumberOfFoodArray = async () => {
    // const result = await this.makingFood(2000).then(() => this.getFoodsArrayAction(this.foodsAsAnArray));
    // alert(result);
  };

  // forLoop = async () => {
  // alert('start');
  // for (let index = 0; index < this.foods.length; index++) {
  //   const foodLabel = this.foods[index].label;
  //   const numFood = await this.getFoodNumber(foodLabel);
  //   alert(numFood);
  // }
  // const foodsPromiseArray = this.foods.map(async (foodObject) => {
  //   for (let i = 0; i < foodObject.length; i++) {
  //     const numFoodAction = foodObject[i].actionLabel;
  //     if (numFoodAction === 'enter') {
  //       alert ('Enter!');
  //     } else if (numFoodAction === 'tab') {
  //       alert('tab!');
  //     }
  //   }
  // });
  // const numberOfFoods = await Promise.all(foodsPromiseArray);
  // alert(numberOfFoods);
  // alert('End');
  // };

  getFoodArray = async () => {};

  render() {
    return (
      <>
        <div className="page" style={{ width: 5000, height: 5000, backgroundColor: 'yellow' }}>
          <div id="root" style={{ backgroundColor: 'blueviolet' }}>
            {/* <div>{this.foods.map(({ label }) => this.getNumberOfFood(label))}</div> */}
            {/* <div>{alert(this.makingFood(50000).then(this.getFoodsArrayAction(this.foodsAsAnArray)))}</div> */}
            {/* <div>{alert(this.getNumberOfFoodArray())}</div> */}
            {/* <div>{alert(this.getAsyncNumberOfFoodArray())}</div> */}
          </div>
        </div>
      </>
    );
  }
}
