import { RouterProvider, Route, route, QueryParameter, RoutingSet, FallbackRoute } from 'victory-router'
import React from 'react'
import './App.css'
import { dynamicNumberParameter, dynamicParameter, queryOptional, queryRequired } from './parameters'
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
          <Route route={dynamicNumberParameter}>
            <OutputParam param={dynamicNumberParameter}>Number param</OutputParam>
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
        <h2>Hardcoded</h2>
        <Route route={'/hardcoded?query=value'}>
          <p>Hard coded query, exact value</p>
        </Route>
        <Route route={'/hardcoded?query'}>
          <p>Hard coded query, any value</p>
        </Route>
        <Route route={'/hardcoded?query='}>
          <p>Hard coded query, no value</p>
        </Route>
        <Route route={'/hardcoded?query!=value'}>
          <p>Hard coded query, not exactly value</p>
        </Route>
        <Route route={'/hardcoded?!query'}>
          <p>Hard coded query, no query</p>
        </Route>
        <h2>Types</h2>
        <Route route={new QueryParameter({ name: 'typed', required: false, type: Number })}>
          <p>Number</p>
        </Route>
        <Route route={new QueryParameter({ name: 'typed', required: false, type: Boolean })}>
          <p>Boolean</p>
        </Route>
        <Route route={new QueryParameter({ name: 'typed', required: false, type: String })}>
          <p>String</p>
        </Route>
        <hr />
        <h1>Composer</h1>
        <Route route={route`/test/path/${dynamicParameter}?${queryOptional}`}>
          <OutputParam param={dynamicParameter}>Dynamic</OutputParam>
          <OutputParam param={queryOptional}>QueryOpt</OutputParam>
        </Route>
        <h1>Fallback</h1>
        <Route route={'fallback-match'} fallback={<p>This is fallback</p>}>
          <p>This is match</p>
        </Route>
        <h1>Routing set</h1>
        <Route route="/set">
          <RoutingSet>
            <p>In set.</p>
            <Route route="/a">
              <p>A</p>
            </Route>
            <Route route="/b">
              <p>B</p>
            </Route>
            <Route route="/c">
              <p>C</p>
            </Route>
            <Route route="/d">
              <p>D</p>
            </Route>
            <FallbackRoute>
              <p>FALLBACK</p>
            </FallbackRoute>
          </RoutingSet>
        </Route>
      </div>
    </RouterProvider>
  )
}

export default App
