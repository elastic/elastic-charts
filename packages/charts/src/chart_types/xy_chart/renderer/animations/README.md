# Animation in charts

This directory contains shared logic for implementing animations throughout charts canvas render methods.

## Animating a value

Currently this animation framework only targets animation or tweening of a specific value that is mapped to a provided `key` string to identify the given value.

### Setup

The setup is fairly simple and requires just a few changes inside the top-level chart type render functions. Starting with the chart type component within `packages/charts/src/chart_types/<chart_type>/renderer/canvas/xxx`. Using `XYChart` type as an example.

The changes required include:

1) Add `animationState` instance property.
2) Initialize the `animationState` in the `constructor`.
3) Add logic to clear animation state on component unmount.
4) Pass the `animationState` to your render function.

```tsx
// packages/charts/src/chart_types/xy_chart/renderer/canvas/xy_chart.tsx

class XYChartComponent extends React.Component<XYChartProps> {
  private animationState: AnimationState; // step 1

  constructor(props: Readonly<XYChartProps>) {
    this.animationState = { rafId: NaN, pool: new Map() }; // step 2
  }

  componentWillUnmount() { // step 3
    window.cancelAnimationFrame(this.animationState.rafId);
    this.animationState.pool.clear();
  }

  private drawCanvas() {
    if (this.ctx) {
      renderXYChartCanvas2d(this.ctx, this.devicePixelRatio, this.props, this.animationState); // step 4
    }
  }
}
```

Next we need to enable the animation context within the render function.

The changes required include:

1) Add the `animationState` to the render function parameters.
2) Wrap all render logic in `render` function closure.
3) Call `getAnimationPoolFn` with `animationState` and `render`.

```diff
+ import { AnimationContext, getAnimationPoolFn } from './animations';
+ import { AnimationState } from './animations/animation';

  export function renderXYChartCanvas2d(
    ctx: CanvasRenderingContext2D,
    dpr: number,
    props: ReactiveChartStateProps,
+   animationState: AnimationState, // step 1
  ) {
+   function render(aCtx: AnimationContext) { // step 2
      const imgCanvas = document.createElement('canvas');

      withContext(ctx, () => {...}
+   }

+   void getAnimationPoolFn(animationState, render); // step 3
  }
```

With these changes in place the `aCtx` context passed to the `render` function will be initialized and ready for use. Now we can animate any value within the `render` function.

### Usage

In order to animate any numerical value in the `render` function, we simply call `aCtx.getValue` with options then the given value. This method reacts to changes in the provided value on each chart render and tweens the value accordingly. An example of this usage is shown below.

```tsx
function render(aCtx: AnimationContext) {
  withContext(ctx, () => {
    const computedOpacity = randomValue(0, 1); // random value from 0 to 1
    const opacity = aCtx.getValue({ delay: 50, duration: 200, timeFunction: 'linear' })('my-opacity', computedOpacity);

    renderRect(opacity); // renders rect with tweened opacity value
  }
}
```

Here the `computedOpacity` is passed to the `aCtx.getValue` with defined `AnimationOptions` and returns the tween `opacity` used to render. The `aCtx.getValue` method uses [currying](https://javascript.info/currying-partials) to enable the same animated options to be used in multiple places.

The `'my-opacity'` string is used to identify this value from all other tracked animated values. This key should be unique given all animation states.

For the time being, using multiple parameterized keys should be _avoided_. For example, given a bar chart with `n` bars using two keys to define `highlighted-bar-opacity` and `unhighlighted-bar-opacity` could minimizes the total tracked values. However, this is currently not supported as the animations work by reacting to changes in values, in this case if key changes when the value changes, the animations state will be malformed causing flashing and instant tweening, see https://github.com/elastic/elastic-charts/pull/1665.

The full list of `AnimationOptions` is shown below.

```tsx
export interface AnimationOptions {
  /**
   * Enables animations on annotations
   */
  enabled?: boolean;
  /**
   * Set initial value for initial render animations.
   * By default, the initial value is determined on the initial render
   * then animates any change thereafter.
   *
   * @example
   * ```ts
   * // Initially animates the height from 0 to 100 with no value change
   * atx.getValue('bar-height', 100, { initialValue: 0 })
   * ```
   */
  initialValue?: AnimatedValue;
  /**
   * start delay in ms
   */
  delay?: TimeMs | AnimationSpeed;
  /**
   * Snaps back to initial value instantly
   */
  snapValues?: AnimatedValue[];
  /**
   * The speed curve of the animation
   */
  timeFunction?: TimeFunction;
  /**
   * Duration from start of animation to completion in ms
   */
  duration?: TimeMs | AnimationSpeed;
}
```

## Future work

### Event-driven

Create a parallel event-driven animation mechanism to offer less control but more predictability for what animations are rendered.

### Greater value support

The only currently supported type of `AnimatedValue` is `number`. We may expand this list to include other values such and colors and more.
