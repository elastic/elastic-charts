# Timeslip / Multilayer time Axis

The timeslip axes rasters a continuos time range into discrete time unit layers.

## Usages

There are currently two usages of the `continuousTimeRasters`. The first is in the `timeslip` chart type here...

https://github.com/elastic/elastic-charts/blob/045fb037a97db7fcad0c3d0af2b31f7a4260149d/packages/charts/src/chart_types/timeslip/timeslip/timeslip_render.ts#L117-L118

The second is in the `xy_chart` via the multilayer ticks here...

https://github.com/elastic/elastic-charts/blob/045fb037a97db7fcad0c3d0af2b31f7a4260149d/packages/charts/src/chart_types/xy_chart/axes/timeslip/multilayer_ticks.ts#L54-L57

## Logical structure

The `continuousTimeRasters` function contains a lot of definitions before finally exporting a final function to return the required `layers` given a `filter` predicate, see the [`notTooDense`](https://github.com/elastic/elastic-charts/blob/045fb037a97db7fcad0c3d0af2b31f7a4260149d/packages/charts/src/chart_types/xy_chart/axes/timeslip/multilayer_ticks.ts#L30-L43) predicate for an example.

> The `notTooDense` filter uses the `minimumTickPixelDistance` value to determine when that layer is suitable for display. This value is static and calibrated manually.

The important definitions are the `AxisLayer` that each define a unique discrete time unit raster layer. These raster layers range from very fine (i.e. milliseconds) to very course (i.e. decades). Generally, these raster layers define the constraints, style and intervals of each raster layer.

The `allRasters` array lists the `AxisLayer`s in order from coarsest to finest.

Last of the definitions is the `replacements`, these are used to replace any number of raster layers when a given layer is present. For example, say one of the final layers is `days`, in such case we would also have `daysUnlabelled` layer because it has the same spacing constraints, thus it's best to remove the `daysUnlabelled` layer because it would be a duplication. These replacements are executed in order so best to order them from coarsest to finest as we do the raster layers.

For `labeled` raster layers, the `detailedLabelFormat` is used only if the raster layer is the last/bottom layer, `minorTickLabelFormat` is used otherwise.
