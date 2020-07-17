<h1 align="center">
  Elastic Charts
</h1>
<p align="center">
  <a href="(https://travis-ci.org/elastic/elastic-charts"><img alt="Build Status" src="https://travis-ci.org/elastic/elastic-charts.svg?branch=master"></a>
  <a href="https://codecov.io/gh/elastic/elastic-charts">
    <img src="https://codecov.io/gh/elastic/elastic-charts/branch/master/graph/badge.svg" />
  </a>
<a href="https://app.fossa.io/projects/git%2Bgithub.com%2Felastic%2Felastic-charts?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.io/api/projects/git%2Bgithub.com%2Felastic%2Felastic-charts.svg?type=shield"/></a>
  <a href="https://www.npmjs.com/@elastic/charts"><img alt="NPM version" src="https://img.shields.io/npm/v/@elastic/charts.svg?style=flat"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg"></a>
  <a href="https://elastic.github.io/elastic-charts">
    <img src="https://img.shields.io/static/v1?label=examples&message=storybook&color=blueviolet">
  </a>
</p>

🚨 **WARNING** While open source, the intended consumers of this repository are Elastic products. Read the [FAQ][faq] for details.

---

You should check out our [living style guide][docs], which contains many examples on how charts look and feel, and how to use them in your products.

You could also check and fork the [codesandbox](https://codesandbox.io/s/elasticcharts-playground-puj4y) example here to play with the code directly

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
A hosted version is available at [https://elastic.github.io/elastic-charts][docs].

## Goals

The primary goal of this library is to provide reusable set of chart components that can be used throughout Elastic's web products.
As a single source of truth, the framework allows our designers to make changes to our look-and-feel directly in the code. And unit test coverage for the charts components allows us to deliver a stable "API for charts".

## Contributing

You can find documentation around creating and submitting new features in [CONTRIBUTING.md][contributing].

## Wiki

### Consumption

- [Consuming Elastic Charts][consuming]

### Documentation

- [Overview][overview]
- [Theming][theming]

## License

[Apache Licensed][license]. Read the [FAQ][faq] for details.

[license]: LICENSE.txt
[faq]: FAQ.md
[docs]: https://elastic.github.io/elastic-charts/
[consuming]: wiki/consuming.md
[overview]: wiki/overview.md
[theming]: wiki/theming.md
[contributing]: CONTRIBUTING.md


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Felastic%2Felastic-charts.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Felastic%2Felastic-charts?ref=badge_large)
