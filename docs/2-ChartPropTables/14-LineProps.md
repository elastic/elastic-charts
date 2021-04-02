### Line component props table

| Prop | Type | Default | Note |
|:------|:------:|:---------:|:------|
| id `(required)`|`string` ||The id of the spec |
| chartType | `typeof ChartType.XYAxis` | ChartType.XYAxis  |  |
| specType  | `typeof SpecType.Series` | SpecType.Series  |  |    
| seriesTypes  | | SeriesType.Line |  |
| groupId  || DEFAULT_GROUP_ID |The ID of the line |
| xScaleType `(required)`| `ScaleType (ScaleType.Ordinal or ScaleType.Linear or ScaleType.Time)`|ScaleType.Ordinal | The x axis scale type |
| yScaleType `(required)`| `ScaleType (ScaleType.Ordinal or ScaleType.Linear or ScaleType.Time)`| ScaleType.Linear | The y axis scale type |
| xAccessor `(required)` | Accessor | 'x' | the field name of the x value on the Datum object|
| yAccessors `(required)`||['y'] | An array of field names one per y metric value |
| yScaleToDataExtent || false ||
| hideInLegend | boolean | false | If the series should appear in the legend|
| histogramModeAlignment | `Start or Center or End` | histogramModeAlignment.Center | Determines how points in the series will align to bands in histogram mode |
| data `(required)` | datum[] |  | An array of data |

***
