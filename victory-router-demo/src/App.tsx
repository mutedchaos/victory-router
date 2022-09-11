import { RouterProvider, Route, route } from 'victory-router'
import React from 'react'
import './App.css'
import { dynamicParameter, queryOptional, queryRequired } from './parameters'
import { WithDynamic } from './WithDynamic'
import { OutputParam } from './OutputParam'

function App() {
  return (
    <RouterProvider>
      <div className="App">
        <div>before</div>
        <Route route="">
          <p>Hello from empty</p>
        </Route>
        <Route route="" exact>
          <p>Hello from empty exact</p>
        </Route>
        <Route route="a">
          <p>Hello from a</p>

          <Route route="b">
            <p>Hello from a/b</p>
          </Route>
          <Route route={dynamicParameter}>
            <WithDynamic />
            <Route route="b">
              <p>Hello from a/d/b</p>
            </Route>
          </Route>
        </Route>
        <Route route="b">
          <p>Hello from b</p>
          <Route route={dynamicParameter}>
            <WithDynamic />
          </Route>
          <Route route={dynamicParameter} exact>
            <WithDynamic>exact</WithDynamic>
          </Route>
        </Route>
        <Route route="c" exact>
          <p>Hello from c</p>
        </Route>
        <div>after</div>
        <hr />
        <h1>Query</h1>
        <Route route={queryRequired}>
          <OutputParam param={queryRequired}>Required</OutputParam>
        </Route>
        <Route exact route={queryRequired}>
          <OutputParam param={queryRequired}>Required exact</OutputParam>
        </Route>{' '}
        <Route route={queryOptional}>
          <OutputParam param={queryOptional}>optional</OutputParam>
        </Route>
        <Route exact route={queryOptional}>
          <OutputParam param={queryOptional}>optional exact</OutputParam>
        </Route>
        <hr />
        <h1>Composer</h1>
        <Route route={route`/test/path/${dynamicParameter}?${queryOptional}`}>
          <OutputParam param={dynamicParameter}>Dynamic</OutputParam>
          <OutputParam param={queryOptional}>QueryOpt</OutputParam>
        </Route>
      </div>
    </RouterProvider>
  )
}

export default App