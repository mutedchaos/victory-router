# Victory Router

A react router. Because everyone needs their own. This one works nicely with typescript.

## The idea

The lack of decent typescript support in most routing solution is unfortunate, and this router provides a way to
deal with some of that.

As you declare routes, you also specify the path and query parameters for the route, and you can then use them in your
components. The parameters can have varying types.

## Installing

Not available from public npm at this time.

## Setting up

Wrap your react application within `RouterProvider` in order to use the route components.

### Declaring routes

#### Static paths

A route is declared with the react component Route. The two most important things to give it are route and children,
the former of which declares the kind of route you wish to have, and children define what is to be rendered if the
route matches the current location.

So, simple case:

    <Route route='/dashboard'>
      <MyDashboard />
    </Route>

Routes can be nested, in which case nested paths are expected

    <Route route='/dashboard'>
      <Route route='/logins'>
        {/* at /dashboard/logins */}
        <LoginDashboard />
      </Route>
      <Route route='/sales'>
      {/* at /dashboard/sales */}
        <SalesDashboard />
      </Route>
    </Route>

You can also use the same method with static query parameters

A specific value:

    <Route route='/list?scope=users'>...

Not a specific value

    <Route route='/list?scope!=users&scope!=sales'>...

Any value

    <Route route='/list?scope'>...

No value

    <Route route='/list?!scope'>...

#### Exact paths

If you wish a route to match only when the path matches exactly (no nested pages), you
can add the "exact" attribute.

    <Route route='/dashboard'> Matches /dashboard and /dashboard/whatever and so on
    <Route route='/dashboard' exact> Matches only /dashboard

At this time there is no way to bypass exactness in situations where a nested route would match.

#### Fallback

Sometimes you might want to make quick decisions based on a route matching or not matching, fallback might help there.

    <Route route='/dashboard?view' fallback={<DashboardSelector />}>
      <DashboardView>
    </Route>

You can also use a routing set to define a fallback for a set of routes

    <RoutingSet>
      <Route route='/dashboard>...</Route>
      <Route route='/events>...</Route>
      <Route route='/admin>...</Route>
      <FallbackRoute>Invalid page</FallbackRoute>
    </RoutingSet>

In this case the fallback route is used if no route within the set matches. Only the uppermost level is considered -- nested routes mathing or not matching has no effect.

#### Parameters

Victory router supports path and query parameters.

The parameters are defined outside of react components, for example in a separate file.

    import { PathParameter, QueryParameter } from 'victory-router'
    const searchQuery = new QueryParameter('query', { required: true })
    const searchContext = new PathParameter()

There are two ways to use the parameters in a route definition.

1.  If all you need is a parameter, just set it up as the route

        <Route route='/search'>
          <Route route={searchContext}>
            <Route route={searchQuery}>
              <SearchView>
            </Route>
          </Route>
        </Route>

2.  As is evident from the example above, this becomes tedious if you have multiple parameters, especially if you are using them right within one another. You can compose the path and all of the parameters into a single route

        import { route } from 'victory-router'

        function RouterComponent() {
          return (
            <Route route={route`/search/${searchContext}?${searchQuery}`}>
              <SearchView />
            </Route>
          )
        }

In order to actually use the parameters in your components, use the `useRouteParameter` hook and give it one of your parameters.

     import { useRouteParameter } from 'victory-router'

     function SearchView() {
        const mySearchContext = useRouteParameter(searchContext)
        const searchQuery = useRouteParameter(searchQuery)
        ...
     }

The hook will throw if no route element containing it included the parameter, so it will very quickly become evident if you've made a mistake.

The values returned will be of the correct type -- by default string for path parameters and required query parameters, string | undefined for optional query parameters.

##### Types

The default PathParameter and QueryParameter classes support the following data types:

- string
- number
- boolean

You can indicate the type of the parameter by passing the constructor of the boxed version of the type as an additional parameter to the parameter constructors

    import { PathParameter, QueryParameter } from 'victory-router'
    const useDarkMode = new QueryParameter('darkMode', { required: true }, Boolean)
    const pageNumberParam = new PathParameter(Number)

Failed parsing treats the route as not matching, fallback can be used here to show an error message, if desired.

    <Route route={useDarkMode} fallback={<p>Parameter missing!</p>}>...

For numbers simple decimal numbers are supported, for booleans

- true and 1 are treated as true
- false and 0 are treated as false
- query parameter being present with no value is considered true (/dashboard?darkMode)
- exceptionally, optional query parameter of type boolean treats the lack of value as false

The types here are fully supported by the `useRouteParameter` hook.

##### Custom parameter handlers

If you need more parsing options, you can have your own subclasses of the ones provided
by the library. For doing more complex things you might want to extend RouteParameter,
for simpler needs (such as additional type parser) extending QueryParameterBase or PathParameterBase should be easier.

A couple of simple examples:

    import { PathParameter, parsingFailed } from 'victory-router'

    class DatePathParameter extends PathParameterBase<Date> {
      parseValue(value: string) {
        const parsed = new Date(value)
        if (isNaN(parsed)) return parsingFailed

        return parsed
      }
    }


    class DateQueryParameter extends QueryParameterBase<Date, {required: true}> {
      constructor(name: string) {
        super(name, {required: true})
      }

      // If required is not hard-coded to true, correct type for parameter is string | undefined
      parseValue(value: string) {
        if (!value) return parsingFailed

        const parsed = new Date(value)
        if (isNaN(parsed.valueOf())) return parsingFailed

        return parsed
      }
    }
