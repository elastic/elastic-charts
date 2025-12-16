# Elastic Charts Documentation

Comprehensive documentation for the Elastic Charts data visualization library.

## 📚 Documentation Structure

### For Beginners
1. **[Introduction](./docs/intro.mdx)** - Overview of Elastic Charts and key features
2. **[Getting Started](./docs/getting-started.mdx)** - Installation and first chart
3. **[Quick Reference](./docs/quick-reference.mdx)** - Fast lookup for common tasks
4. **[Examples](./examples/intro.md)** - Interactive examples and Storybook

### For Developers
5. **[Core Concepts](./docs/core-concepts.mdx)** - Data, scales, series, and interactions
6. **[Components Reference](./docs/components.mdx)** - Complete API documentation
7. **[Chart Types Guide](./docs/chart-types.mdx)** - Detailed guide for each chart type
8. **[Theming and Styling](./docs/theming.mdx)** - Visual customization

### For Contributors
9. **[Architecture Overview](./docs/architecture.mdx)** - Internal architecture and design
10. **[Contributing Guide](./docs/contributing.mdx)** - How to contribute to the project

## 🚀 Quick Start

```bash
# Install
yarn add @elastic/charts

# Import styles
import '@elastic/charts/dist/theme.css';

# Create a chart
import { Chart, Settings, BarSeries, ScaleType } from '@elastic/charts';

<Chart size={{ height: 300 }}>
  <Settings />
  <BarSeries
    id="sales"
    data={[
      { month: 'Jan', sales: 100 },
      { month: 'Feb', sales: 150 },
    ]}
    xAccessor="month"
    yAccessors={['sales']}
    xScaleType={ScaleType.Ordinal}
    yScaleType={ScaleType.Linear}
  />
</Chart>
```

## 📖 Documentation Features

### Comprehensive Coverage
- ✅ **9 detailed guides** covering all aspects
- ✅ **100+ code examples** ready to use
- ✅ **All chart types** documented with examples
- ✅ **Architecture deep-dive** for contributors
- ✅ **Complete API reference** for all components

### Progressive Learning
- 📈 **Beginner to Advanced** - Start simple, go deep
- 💡 **Theory + Practice** - Concepts with examples
- 🎯 **Goal-Oriented** - Organized by what you want to achieve
- 🔍 **Searchable** - Find what you need quickly

### Developer-Friendly
- 💻 **TypeScript examples** throughout
- 📋 **Copy-paste ready** code snippets
- ⚡ **Performance tips** included
- 🎨 **Theming examples** for customization
- ♿ **Accessibility guidance** built-in

## 🗺️ Learning Paths

### Path 1: New User (30 min)
```
Introduction → Getting Started → Examples
```
**Goal**: Create your first chart

### Path 2: Developer (2-4 hours)
```
Core Concepts → Chart Types → Components Reference → Theming
```
**Goal**: Build complex, customized visualizations

### Path 3: Contributor (4-8 hours)
```
Architecture → Contributing → Explore Source Code
```
**Goal**: Contribute improvements

### Path 4: Designer (1-2 hours)
```
Examples → Theming → Chart Types
```
**Goal**: Customize appearance and understand capabilities

## 📊 Chart Types Covered

### XY Charts
- Bar Charts (vertical, horizontal, stacked, grouped)
- Line Charts (basic, multi-line, smooth, stepped)
- Area Charts (basic, stacked, percentage, banded)
- Bubble Charts
- Mixed Charts

### Partition Charts
- Pie Charts
- Donut Charts
- Sunburst (hierarchical)
- Treemap
- Icicle/Mosaic

### Specialized Charts
- Heatmaps
- Goal/Gauge Charts
- Bullet Graphs
- Wordclouds
- Flame Charts
- Metric Displays

## 🎨 Key Topics

- **Data & Accessors** - Working with different data formats
- **Scales** - Linear, ordinal, time, log transformations
- **Themes** - Built-in themes and custom styling
- **Interactions** - Clicks, tooltips, brushing, zooming
- **Annotations** - Adding context to charts
- **Legends** - Configuration and customization
- **Axes** - Multiple axes, formatting, styling
- **Performance** - Optimization techniques
- **Accessibility** - WCAG compliance

## 🔗 External Resources

- **[Live Storybook](https://elastic.github.io/elastic-charts/storybook/)** - Interactive examples
- **[CodeSandbox](https://codesandbox.io/p/sandbox/elastic-charts-playground-gmnjx9)** - Online playground
- **[GitHub Repository](https://github.com/elastic/elastic-charts)** - Source code
- **[npm Package](https://www.npmjs.com/package/@elastic/charts)** - Package details

## 🛠️ Running Documentation Locally

```bash
# Clone the repository
git clone https://github.com/elastic/elastic-charts.git
cd elastic-charts/docs

# Install dependencies
yarn

# Start documentation site
yarn start
```

Visit `http://localhost:3000` to browse the documentation.

## 📝 Documentation Guidelines

### For Writers
- Use clear, concise language
- Include code examples for every concept
- Test all code examples
- Add cross-references between sections
- Follow the existing structure and style

### For Maintainers
- Keep documentation in sync with code changes
- Update examples when APIs change
- Review contributions for accuracy
- Ensure TypeScript types are correct
- Maintain consistent formatting

## 🤝 Contributing to Documentation

Found an error or want to improve the docs?

1. **Report Issues**: [GitHub Issues](https://github.com/elastic/elastic-charts/issues)
2. **Submit PRs**: See [Contributing Guide](./docs/contributing.mdx)
3. **Add Examples**: Contribute to Storybook
4. **Improve Clarity**: Suggest better explanations

## 📋 Documentation Checklist

When adding new features, ensure:

- [ ] API documentation updated
- [ ] Examples added to Storybook
- [ ] Relevant guides updated
- [ ] TypeScript types documented
- [ ] Breaking changes noted
- [ ] Migration guide provided (if needed)

## 📚 Additional Resources

### Tutorials
- Getting Started Guide
- Chart Type Walkthroughs
- Theming Tutorial
- Performance Optimization Guide

### References
- Component API Reference
- TypeScript Type Definitions
- Theme Structure Reference
- Event Handler Reference

### Community
- GitHub Discussions
- Issue Tracker
- Example Gallery
- Community Examples

## 🎯 Documentation Goals

1. **Accessibility** - Easy to find and understand information
2. **Completeness** - Cover all features and use cases
3. **Accuracy** - Keep documentation synchronized with code
4. **Usefulness** - Solve real problems for users
5. **Maintainability** - Easy to update and extend

## 📊 Documentation Stats

- **9 comprehensive guides** (2,500+ lines)
- **100+ code examples**
- **15+ chart types covered**
- **Complete API reference**
- **Architecture documentation**
- **Contributing guidelines**

## 🚀 What's Next?

- [ ] Add video tutorials
- [ ] Create interactive playground in docs
- [ ] Add more real-world examples
- [ ] Expand troubleshooting section
- [ ] Add migration guides
- [ ] Create cheat sheets
- [ ] Add internationalization examples

## 📞 Support

- **Documentation Issues**: [File an issue](https://github.com/elastic/elastic-charts/issues)
- **Questions**: [GitHub Discussions](https://github.com/elastic/elastic-charts/discussions)
- **Chat**: [Elastic Community Slack](https://ela.st/slack)

## 📄 License

Documentation is licensed under the same license as Elastic Charts:
- Elastic License 2.0
- Server Side Public License, v 1

See [LICENSE](../LICENSE.txt) for details.

---

**Made with ❤️ by the Elastic DataVis team and contributors**
