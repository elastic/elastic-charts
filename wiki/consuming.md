# Consuming Elastic Charts

### Components

You can import Chart components from the top-level Elastic Chart module.

```js
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType } from '@elastic/charts';
```

## Using Elastic Charts in Kibana

To use Elastic Charts code in Kibana, check if `@elastic/charts` packages is already configured as dependency in `package.json` and simply import the components you want.

## Using Elastic Charts in a standalone project

You can consume Elastic Charts in standalone projects, such as plugins and prototypes.

### Importing CSS

You need to import a CSS style, related to the theme you are using. You can use Webpack or another bundler to import the compiled CSS style with the `style`,`css`, and `postcss` loaders.

```js
import '@elastic/charts/dist/theme_dark.css';
// or
import '@elastic/charts/dist/theme_light.css';
```
