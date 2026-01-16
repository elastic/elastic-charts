/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { Component } from 'react';

import { CHANGE_SERIES_COLOR } from './color';
import { LegendValue } from '../../common/legend';
import { SeededDataGenerator } from '../../mocks/utils';
import { ScaleType } from '../../scales/constants';
import type { LegendColorPicker } from '../../specs';
import { Settings, BarSeries } from '../../specs';
import { Chart } from '../chart';

const dg = new SeededDataGenerator();

describe('Legend', () => {
  it('shall render the all the series names', () => {
    render(
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
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(4);
    items.forEach((item, i: number) => {
      expect(item.textContent?.replace(/\s+/g, '')).toBe(`group${i}123`);
    });
  });
  it('shall render the all the series names without the data value', () => {
    render(
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
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(4);
    items.forEach((item, i: number) => {
      expect(item.textContent?.replace(/\s+/g, '')).toBe(`group${i}`);
    });
  });
  it('shall call the over and out listeners for every list item', () => {
    const onLegendItemOver = jest.fn();
    const onLegendItemOut = jest.fn();
    const numberOfSeries = 4;
    const data = dg.generateGroupedSeries(10, numberOfSeries, 'split');
    render(
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
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(numberOfSeries);
    items.forEach((item, i: number) => {
      fireEvent.mouseEnter(item);
      expect(onLegendItemOver).toHaveBeenCalledTimes(i + 1);
      fireEvent.mouseLeave(item);
      expect(onLegendItemOut).toHaveBeenCalledTimes(i + 1);
    });
  });
  it('shall call click listener for every list item', () => {
    const onLegendItemClick = jest.fn();
    const numberOfSeries = 4;
    const data = dg.generateGroupedSeries(10, numberOfSeries, 'split');
    render(
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
    const labels = screen.queryAllByTestId('echLegendItemLabel');
    expect(labels.length).toBe(numberOfSeries);
    labels.forEach((label, i: number) => {
      fireEvent.click(label);
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
        <div id="colorPicker" data-testid="customColorPicker">
          <span>Custom Color Picker</span>
          <button
            id="change"
            data-testid="customColorPickerChange"
            type="button"
            onClick={() => {
              this.setState<any>({ colors: [this.props.customColor] });
              onClose();
            }}
          >
            {this.props.customColor}
          </button>
          <button id="close" type="button" onClick={onClose} data-testid="customColorPickerClose">
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

    const customColor = '#0c7b93';
    const onLegendItemClick = jest.fn();

    beforeEach(() => {
      render(<LegendColorPickerMock customColor={customColor} onLegendItemClick={onLegendItemClick} />);
    });

    const clickFirstColor = () => {
      const items = screen.queryAllByRole('listitem');
      expect(items.length).toBe(4);
      const first = items[0];
      if (first) {
        const colorBtn = within(first).getByTitle(CHANGE_SERIES_COLOR);
        if (colorBtn) fireEvent.click(colorBtn);
      }
    };

    it('should render colorPicker when color is clicked', () => {
      clickFirstColor();
      const colorPicker = screen.queryByTestId('customColorPicker');
      expect(colorPicker).toBeTruthy();
    });

    it('should set isOpen to false after onChange is called', () => {
      clickFirstColor();
      const btn = screen.queryByTestId('customColorPickerChange');
      if (btn) fireEvent.click(btn);
      expect(screen.queryByTestId('customColorPicker')).toBeFalsy();
    });

    it('should set color after onChange is called', () => {
      clickFirstColor();
      const btn = screen.queryByTestId('customColorPickerChange');
      if (btn) fireEvent.click(btn);
      const items = screen.queryAllByRole('listitem');
      expect(items.length).toBe(4);
      const first = items[0];
      expect(first).toBeTruthy();
      const dot = within(first!).queryByTestId('echLegendIconPath');
      expect(dot?.getAttribute('fill')).toBe(customColor);
    });

    it('should match snapshot after onClose is called', () => {
      clickFirstColor();
      const btn = screen.queryByTestId('customColorPickerClose');
      if (btn) fireEvent.click(btn);
      expect(screen.queryByTestId('customColorPicker')).toBeFalsy();
    });

    it('should set isOpen to false after onClose is called', () => {
      clickFirstColor();
      const btn = screen.queryByTestId('customColorPickerClose');
      if (btn) fireEvent.click(btn);
      expect(screen.queryByTestId('customColorPicker')).toBeFalsy();
    });

    it('should call click listener for every list item', () => {
      const labels = screen.queryAllByTestId('echLegendItemLabel');
      expect(labels.length).toBe(4);
      labels.forEach((label, i: number) => {
        fireEvent.click(label);
        expect(onLegendItemClick).toHaveBeenCalledTimes(i + 1);
      });
    });
  });
  describe('disable toggle and click for one legend item', () => {
    it('should not be able to click or focus if there is only one legend item in total legend items', () => {
      const onLegendItemClick = jest.fn();
      const data = [{ x: 2, y: 5 }];
      render(
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
      const labels = screen.queryAllByTestId('echLegendItemLabel');
      expect(labels).toHaveLength(1);
      labels.forEach((label) => {
        fireEvent.click(label);
        expect(onLegendItemClick).toHaveBeenCalledTimes(0);
      });
    });
  });
  describe('legend table', () => {
    it('should render legend table when there is a legend value that is not CurrentAndLastValue', () => {
      render(
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
      const table = screen.queryByRole('table');
      expect(table).toBeTruthy();
      const rows = screen.queryAllByRole('row');
      expect(rows).toHaveLength(5);
      const expected = ['Min', 'group0123', 'group1123', 'group2123', 'group3123'];
      rows.forEach((row, i) => {
        expect(row.textContent?.replace(/\s+/g, '')).toBe(expected[i]);
      });
    });
  });
  describe('showLegendActionAlways', () => {
    const Action = () => <>Action</>;

    it('should always show the action when showLegendActionAlways is true', () => {
      render(
        <Chart>
          <Settings showLegend showLegendActionAlways legendAction={Action} />
          <BarSeries id="series" data={[{ x: 1, y: 1 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );
      const action = screen.getByText('Action');
      // Expect to not have echLegendItem__action--hide class
      expect(action).toHaveClass('echLegendItem__action');
    });

    it('should show the action on hover when showLegendActionAlways is false', () => {
      render(
        <Chart>
          <Settings showLegend legendAction={Action} />
          <BarSeries id="series" data={[{ x: 1, y: 1 }]} xAccessor="x" yAccessors={['y']} />
        </Chart>,
      );

      const action = screen.getByText('Action');

      // Initially has the "hide" class
      expect(action).toHaveClass('echLegendItem__action echLegendItem__action--hide');
    });
  });
});
