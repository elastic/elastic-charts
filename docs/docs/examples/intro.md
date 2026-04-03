---
id: examples
title: Examples
sidebar_label: Examples
sidebar_position: 0
---

# Interactive Examples

Welcome to the Elastic Charts interactive examples! This section provides hands-on demonstrations of chart capabilities and features.

## Storybook

The best way to explore examples is through our **interactive Storybook**:

🔗 **[View Storybook Examples](https://elastic.github.io/elastic-charts/storybook/)**

Storybook provides:
- **Live code editing**: Modify examples in real-time
- **Interactive controls**: Adjust properties with knobs
- **Visual variations**: See different configurations side-by-side
- **Responsive testing**: Test charts at different screen sizes
- **Accessibility inspection**: Check a11y compliance

## Example Categories

### XY Charts
- **Bar Charts**: Vertical, horizontal, stacked, grouped, histogram
- **Line Charts**: Basic, multi-series, smooth curves, stepped lines
- **Area Charts**: Simple, stacked, percentage, banded
- **Mixed Charts**: Combined bar and line charts
- **Bubble Charts**: Size-encoded scatter plots
- **Interactions**: Brushing, zooming, clicking, custom tooltips

### Partition Charts
- **Pie Charts**: Basic pie, donut charts
- **Sunburst**: Multi-level hierarchical visualization
- **Treemap**: Area-encoded hierarchies
- **Icicle**: Horizontal partition charts
- **Mosaic**: Rectangular partitions

### Specialized Charts
- **Heatmaps**: Time-based patterns, correlation matrices
- **Goal Charts**: Progress indicators, gauges
- **Bullet Graphs**: Performance metrics
- **Wordclouds**: Text frequency visualization
- **Flame Charts**: Performance profiling
- **Metric Displays**: KPI visualization

### Features
- **Axes**: Custom formatting, multiple axes, log scales
- **Annotations**: Lines, rectangles, custom markers
- **Legends**: Positioning, actions, custom rendering
- **Themes**: Light/dark modes, custom color palettes
- **Tooltips**: Custom content, formatting, positioning
- **Interactions**: Click handlers, selections, brushing
- **Animations**: Smooth transitions, entrance animations

## Quick Examples

### Simple Bar Chart

```tsx
import { Chart, Settings, BarSeries, ScaleType } from '@elastic/charts';

<Chart size={{ height: 300 }}>
  <Settings showLegend />
  <BarSeries
    id="bars"
    name="Sales"
    data={[
      { x: 'Q1', y: 100 },
      { x: 'Q2', y: 150 },
      { x: 'Q3', y: 120 },
      { x: 'Q4', y: 180 },
    ]}
    xAccessor="x"
    yAccessors={['y']}
    xScaleType={ScaleType.Ordinal}
    yScaleType={ScaleType.Linear}
  />
</Chart>
```

### Time Series Line Chart

```tsx
import { Chart, Settings, LineSeries, ScaleType, Axis, Position } from '@elastic/charts';
import { timeFormatter } from '@elastic/charts';

<Chart size={{ height: 300 }}>
  <Settings />
  <Axis
    id="bottom"
    position={Position.Bottom}
    tickFormat={timeFormatter('MM/DD')}
  />
  <Axis id="left" position={Position.Left} />
  <LineSeries
    id="timeseries"
    name="Traffic"
    data={timeSeriesData}
    xAccessor="timestamp"
    yAccessors={['visitors']}
    xScaleType={ScaleType.Time}
    yScaleType={ScaleType.Linear}
  />
</Chart>
```

### Interactive Pie Chart

```tsx
import { Chart, Settings, Partition, PartitionLayout } from '@elastic/charts';

<Chart size={{ height: 300 }}>
  <Settings
    onElementClick={(elements) => {
      console.log('Clicked:', elements);
    }}
  />
  <Partition
    id="pie"
    data={pieData}
    valueAccessor={(d) => d.value}
    layers={[
      {
        groupByRollup: (d) => d.category,
      },
    ]}
    config={{
      partitionLayout: PartitionLayout.sunburst,
    }}
  />
</Chart>
```

## Exploring Examples

### By Use Case

1. **Getting Started**
   - Basic charts for beginners
   - Common patterns and recipes
   - Quick start templates

2. **Advanced Techniques**
   - Complex interactions
   - Custom rendering
   - Performance optimization

3. **Best Practices**
   - Accessibility examples
   - Responsive design
   - Color theory applications

### By Chart Type

Navigate to specific chart type examples:
- [Bar Charts](https://elastic.github.io/elastic-charts/storybook/?path=/story/bar-chart)
- [Line Charts](https://elastic.github.io/elastic-charts/storybook/?path=/story/line-chart)
- [Area Charts](https://elastic.github.io/elastic-charts/storybook/?path=/story/area-chart)
- [Pie Charts](https://elastic.github.io/elastic-charts/storybook/?path=/story/partition-charts)
- [And more...](https://elastic.github.io/elastic-charts/storybook/)

## CodeSandbox Playground

Experiment with Elastic Charts in a full development environment:

🔗 **[Open in CodeSandbox](https://codesandbox.io/p/sandbox/elastic-charts-playground-gmnjx9?file=%2Fsrc%2FApp.tsx)**

The playground includes:
- Full React development environment
- All Elastic Charts packages
- Example datasets
- Hot module reloading

## Running Examples Locally

To run examples on your local machine:

```bash
# Clone the repository
git clone https://github.com/elastic/elastic-charts.git
cd elastic-charts

# Install dependencies
yarn

# Start Storybook
yarn storybook
```

Visit `http://localhost:9001` to browse all examples.

## Example Source Code

All examples are available in the repository:

```
elastic-charts/
└── storybook/
    └── stories/
        ├── bar/           # Bar chart examples
        ├── line/          # Line chart examples
        ├── area/          # Area chart examples
        ├── partition/     # Pie, sunburst, treemap
        ├── heatmap/       # Heatmap examples
        ├── goal/          # Goal chart examples
        └── ...
```

## Contributing Examples

Found a useful pattern? Consider contributing it!

1. Create a new story file in the appropriate directory
2. Add interactive controls using Storybook knobs
3. Document the example with comments
4. Submit a pull request

See our [Contributing Guide](../docs/contributing) for details.

## Need Help?

- **Documentation**: Check the [Getting Started](../docs/getting-started) guide
- **API Reference**: See [Components Reference](../docs/components)
- **Issues**: Report problems on [GitHub](https://github.com/elastic/elastic-charts/issues)

## What's Next?

- Explore the [Storybook](https://elastic.github.io/elastic-charts/storybook/)
- Read the [Architecture Guide](../docs/architecture)
- Learn about [Theming](../docs/theming)
- Check out [Chart Types](../docs/chart-types)
