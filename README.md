<h1 align="center">
  <img src="https://raw.githubusercontent.com/elastic/elastic-charts/main/public/logo.png" alt="elastic-charts logo" width="100" /><br />
  Elastic Charts
</h1>
<p align="center">
  <a href="https://buildkite.com/elastic/datavis-ci/builds?branch=main">
    <img alt="Build Status - main branch" src="https://badge.buildkite.com/1b2f6369ef27e5b23a7fccf2545d7d6e31bff1957c7c941d31.svg?branch=main">
  </a>
  <a href="https://www.npmjs.com/@elastic/charts"><img alt="NPM version" src="https://img.shields.io/npm/v/@elastic/charts.svg"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg"></a>
  <a href="https://elastic.github.io/elastic-charts/storybook">
    <img src="https://img.shields.io/static/v1?label=examples&message=storybook&color=ff4685">
  </a>
</p>



Check out our [living style guide][docs], which contains many examples on how charts look and feel, and how to use them in your products or fork the [codesandbox](https://codesandbox.io/p/sandbox/elastic-charts-playground-gmnjx9?file=%2Fsrc%2FApp.tsx) example here to play directly with the library.

## Installation

To install the Elastic Charts into an existing project, use the `yarn` CLI (`npm` is not supported).

```
yarn add @elastic/charts
```

> **Important:** see the [consuming] wiki for detailed installation requirements

## Running Locally

### Node

We depend upon the version of node defined in [.nvmrc](.nvmrc).

You will probably want to install a node version manager. [nvm](https://github.com/creationix/nvm) is recommended.

To install and use the correct node version with `nvm`:

```
nvm install
```

### Development environment

You can run the dev environment locally at [http://localhost:9001](http://localhost:9001/) by running:

```
yarn
yarn start
```

We use [storybook](https://storybook.js.org) to document API, edge-cases, and the usage of the library.
A hosted version is available at [https://elastic.github.io/elastic-charts/storybook][docs].

## Goals

The primary goal of this library is to provide reusable set of chart components that can be used throughout Elastic's web products.
As a single source of truth, the framework allows our designers to make changes to our look-and-feel directly in the code. And unit test coverage for the charts components allows us to deliver a stable "API for charts".

## Contributing

You can find documentation around creating and submitting new features in [contributing][contributing].

## [Wiki][wikiroot]

### Consumption

- [Consuming Elastic Charts][consuming]

### Documentation

- [Overview][overview]
- [Theming][theming]

## License

[Dual-licensed under Elastic v2 and Server Side Public License, v 1][license] Read the [FAQ][faq] for details.

[license]: LICENSE.txt
[wikiroot]: https://github.com/elastic/elastic-charts/wiki
[faq]: https://github.com/elastic/elastic-charts/wiki/FAQ
[docs]: https://elastic.github.io/elastic-charts/storybook/
[consuming]: https://github.com/elastic/elastic-charts/wiki/Consuming-@elastic-charts
[overview]: https://github.com/elastic/elastic-charts/wiki/Overview
[theming]: https://github.com/elastic/elastic-charts/wiki/Theming
[contributing]: https://github.com/elastic/elastic-charts/wiki/Contributing-to-Elastic-Charts
