/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ReactWrapper } from 'enzyme';
import { mount } from 'enzyme';
import React, { Component } from 'react';

import { Legend } from './legend';
import { LegendListItem } from './legend_item';
import { LegendTable } from './legend_table';
import { LegendTableRow } from './legend_table/legend_table_row';
import { LegendValue } from '../../common/legend';
import { SeededDataGenerator } from '../../mocks/utils';
import { ScaleType } from '../../scales/constants';
import type { LegendColorPicker } from '../../specs';
import { Settings, BarSeries } from '../../specs';
import { Chart } from '../chart';

const dg = new SeededDataGenerator();

describe('Legend', () => {
  it('shall render the all the series names', () => {
    const wrapper = mount(
      <Chart>
        <Settings showLegend legendValues={[LegendValue.CurrentAndLastValue]} />
        <BarSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          data={[
            [0, 123, 'group0'],
            [0, 123, 'group1'],
            [0, 123, 'group2'],
            [0, 123, 'group3'],
          ]}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    expect(legendItems).toHaveLength(4);
    legendItems.forEach((legendItem, i) => {
      // the legend item shows also the value as default parameter
      expect(legendItem.text()).toBe(`group${i}123`);
    });
  });
  it('shall render the all the series names without the data value', () => {
    const wrapper = mount(
      <Chart>
        <Settings showLegend legendValues={[]} />
        <BarSeries
          id="areas"
          name="area"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          splitSeriesAccessors={[2]}
          data={[
            [0, 123, 'group0'],
            [0, 123, 'group1'],
            [0, 123, 'group2'],
            [0, 123, 'group3'],
          ]}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    expect(legendItems).toHaveLength(4);
    legendItems.forEach((legendItem, i) => {
      // the legend item shows also the value as default parameter
      expect(legendItem.text()).toBe(`group${i}`);
    });
  });
  it('shall call the over and out listeners for every list item', () => {
    const onLegendItemOver = jest.fn();
    const onLegendItemOut = jest.fn();
    const numberOfSeries = 4;
    const data = dg.generateGroupedSeries(10, numberOfSeries, 'split');
    const wrapper = mount(
      <Chart>
        <Settings
          showLegend
          legendValues={[LegendValue.CurrentAndLastValue]}
          onLegendItemOver={onLegendItemOver}
          onLegendItemOut={onLegendItemOut}
        />
        <BarSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={data}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    legendItems.forEach((legendItem, i) => {
      legendItem.simulate('mouseenter');
      expect(onLegendItemOver).toHaveBeenCalledTimes(i + 1);
      legendItem.simulate('mouseleave');
      expect(onLegendItemOut).toHaveBeenCalledTimes(i + 1);
    });
  });
  it('shall call click listener for every list item', () => {
    const onLegendItemClick = jest.fn();
    const numberOfSeries = 4;
    const data = dg.generateGroupedSeries(10, numberOfSeries, 'split');
    const wrapper = mount(
      <Chart>
        <Settings showLegend legendValues={[LegendValue.CurrentAndLastValue]} onLegendItemClick={onLegendItemClick} />
        <BarSeries
          id="areas"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={data}
        />
      </Chart>,
    );
    const legendWrapper = wrapper.find(Legend);
    expect(legendWrapper.exists).toBeTruthy();
    const legendItems = legendWrapper.find(LegendListItem);
    expect(legendItems.exists).toBeTruthy();
    expect(legendItems).toHaveLength(4);
    legendItems.forEach((legendItem, i) => {
      // the click is only enabled on the title
      legendItem.find('.echLegendItem__label').simulate('click');
      expect(onLegendItemClick).toHaveBeenCalledTimes(i + 1);
    });
  });

  describe('#legendColorPicker', () => {
    class LegendColorPickerMock extends Component<
      { onLegendItemClick: () => void; customColor: string },
      { colors: string[] }
    > {
      state = {
        colors: ['red'],
      };

      data = dg.generateGroupedSeries(10, 4, 'split');

      legendColorPickerFn: LegendColorPicker = ({ onClose }) => (
        <div id="colorPicker">
          <span>Custom Color Picker</span>
          <button
            id="change"
            type="button"
            onClick={() => {
              this.setState<any>({ colors: [this.props.customColor] });
              onClose();
            }}
          >
            {this.props.customColor}
          </button>
          <button id="close" type="button" onClick={onClose}>
            close
          </button>
        </div>
      );

      render() {
        return (
          <Chart>
            <Settings
              showLegend
              onLegendItemClick={this.props.onLegendItemClick}
              legendColorPicker={this.legendColorPickerFn}
            />
            <BarSeries
              id="areas"
              xScaleType={ScaleType.Linear}
              yScaleType={ScaleType.Linear}
              xAccessor="x"
              yAccessors={['y']}
              splitSeriesAccessors={['g']}
              color={this.state.colors}
              data={this.data}
            />
          </Chart>
        );
      }
    }

    let wrapper: ReactWrapper;
    const customColor = '#0c7b93';
    const onLegendItemClick = jest.fn();

    beforeEach(() => {
      wrapper = mount(<LegendColorPickerMock customColor={customColor} onLegendItemClick={onLegendItemClick} />);
    });

    const clickFirstColor = () => {
      const legendWrapper = wrapper.find(Legend);
      expect(legendWrapper.exists).toBeTruthy();
      const legendItems = legendWrapper.find(LegendListItem);
      expect(legendItems.exists).toBeTruthy();
      expect(legendItems).toHaveLength(4);
      legendItems.first().find('.echLegendItem__color').simulate('click');
    };

    it('should render colorPicker when color is clicked', () => {
      clickFirstColor();
      expect(wrapper.find('#colorPicker').debug()).toMatchSnapshot();
      expect(
        wrapper
          .find(LegendListItem)
          .map((e) => e.debug())
          .join(''),
      ).toMatchSnapshot();
    });

    it('should match snapshot after onChange is called', () => {
      clickFirstColor();
      wrapper.find('#change').simulate('click').first();

      expect(
        wrapper
          .find(LegendListItem)
          .map((e) => e.debug())
          .join(''),
      ).toMatchSnapshot();
    });

    it('should set isOpen to false after onChange is called', () => {
      clickFirstColor();
      wrapper.find('#change').simulate('click').first();
      expect(wrapper.find('#colorPicker').exists()).toBe(false);
    });

    it('should set color after onChange is called', () => {
      clickFirstColor();
      wrapper.find('#change').simulate('click').first();
      const dot = wrapper.find('.echLegendItem__color svg');
      expect(dot.first().html().includes(`${customColor}`)).toBe(true);
    });

    it('should match snapshot after onClose is called', () => {
      clickFirstColor();
      wrapper.find('#close').simulate('click').first();
      expect(
        wrapper
          .find(LegendListItem)
          .map((e) => e.debug())
          .join(''),
      ).toMatchSnapshot();
    });

    it('should set isOpen to false after onClose is called', () => {
      clickFirstColor();
      wrapper.find('#close').simulate('click').first();
      expect(wrapper.find('#colorPicker').exists()).toBe(false);
    });

    it('should call click listener for every list item', () => {
      const legendWrapper = wrapper.find(Legend);
      expect(legendWrapper.exists).toBeTruthy();
      const legendItems = legendWrapper.find(LegendListItem);
      expect(legendItems.exists).toBeTruthy();
      expect(legendItems).toHaveLength(4);
      legendItems.forEach((legendItem, i) => {
        // toggle click is only enabled on the title
        legendItem.find('.echLegendItem__label').simulate('click');
        expect(onLegendItemClick).toHaveBeenCalledTimes(i + 1);
      });
    });
  });
  describe('disable toggle and click for one legend item', () => {
    it('should not be able to click or focus if there is only one legend item in total legend items', () => {
      const onLegendItemClick = jest.fn();
      const data = [{ x: 2, y: 5 }];
      const wrapper = mount(
        <Chart>
          <Settings showLegend legendValues={[LegendValue.CurrentAndLastValue]} onLegendItemClick={onLegendItemClick} />
          <BarSeries
            id="areas"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            data={data}
            xAccessor="x"
            yAccessors={['y']}
          />
        </Chart>,
      );
      const legendItems = wrapper.find(LegendListItem);
      expect(legendItems.length).toBe(1);
      legendItems.forEach((legendItem) => {
        // the click is only enabled on the title
        legendItem.find('.echLegendItem__label').simulate('click');
        expect(onLegendItemClick).toHaveBeenCalledTimes(0);
      });
    });
  });
  describe('legend table', () => {
    it('should render legend table when there is a legend value that is not CurrentAndLastValue', () => {
      const wrapper = mount(
        <Chart>
          <Settings showLegend legendValues={[LegendValue.Min]} />
          <BarSeries
            id="areas"
            name="area"
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            splitSeriesAccessors={[2]}
            data={[
              [0, 123, 'group0'],
              [0, 123, 'group1'],
              [0, 123, 'group2'],
              [0, 123, 'group3'],
            ]}
          />
        </Chart>,
      );
      const legendTable = wrapper.find(LegendTable);
      expect(legendTable.exists).toBeTruthy();
      const legendRows = legendTable.find(LegendTableRow);
      expect(legendRows.exists).toBeTruthy();
      expect(legendRows).toHaveLength(5);
      const expected = ['Min', 'group0123', 'group1123', 'group2123', 'group3123'];
      legendRows.forEach((row, i) => {
        expect(row.text()).toBe(expected[i]);
      });
    });
  });
});
