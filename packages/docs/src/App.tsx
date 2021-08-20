import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { Chart, AreaSeries, Position, ScaleType, Axis } from '@elastic/charts/src';
import '@elastic/charts/src/theme_light.scss';


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
        <Chart size={[500, 500]}>
          <Axis id={'left'} position={Position.Left} />
          <AreaSeries
            id="area"
            xScaleType={ScaleType.Time}
            yScaleType={ScaleType.Linear}
            xAccessor={0}
            yAccessors={[1]}
            data={[
              [1, 100],
              [2, 30],
              [3, 50],
              [4, 60],
              [5, 100],
              [6, 30],
              [7, 50],
              [8, 60],
              [9, 100],
              [10, 30],
              [11, 50],
              [12, 60],
            ]}
          />
        </Chart>
    </div>
  )
}

export default App
