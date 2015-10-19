# reflux-promise

Plugin for [reflux-core](http://github.com/reflux/reflux-core) to use Promises.

Here are the [API docs](docs/api/PublisherMethods.md) for reflux-promise.

## Installation

You can currently install the package as an npm package.

### NPM

The following command installs `reflux-promise` as an npm package:

    npm install reflux-promise

## Usage

To install promise functionality do the following in your application's bootstrapper:

```javascript
import Reflux from "reflux";
import RefluxPromise from "reflux-promise";

// Uses the user agent's Promise implementation
Reflux.use(RefluxPromise(window.Promise));

// Uses Q
import Q from "q";
Reflux.use(RefluxPromise(Q.Promise));

// Uses bluebird
import bluebird from "bluebird";
Reflux.use(RefluxPromise(bluebird))
```

### Extensions to Asynchronous actions

`reflux-promise` extends asynchronous actions, i.e.:

```javascript
// this creates 'load', 'load.completed' and 'load.failed'
var { load } = Reflux.createActions({
    "load": {children: ["completed","failed"]}
});
```

A couple of helper methods are available to trigger the `completed` and `failed` child actions:

* `promise`

* `listenAndPromise`

The following are all equivalent:

```javascript
// Using load above with a promise here called "apiPromise"
load.listen( function(arguments) {
    apiPromise(arguments)
        .then(load.completed)
        .catch(load.failed);
});

// Can be shortened down to use `promise` like below
load.listen( function(arguments) {
    load.promise( apiPromise(arguments) );
});

// Furthermore with `listenAndPromise`
load.listenAndPromise( apiPromise );
```

### Asynchronous actions as Promises

`PublisherMethods#triggerAsync` is modified so that asynchronous actions can be used as promises. The following example is for server-side rendering when you must await the successful (or failed) completion of an action before rendering. Suppose you had an action, `makeGetRequest`, and a store, `RequestStore`, to make an API request:

```javascript
// Create async action with `completed` & `failed` children
var makeGetRequest = Reflux.createAction({ asyncResult: true });

var RequestStore = Reflux.createStore({
    init: function() {
        this.listenTo(makeRequest, 'onMakeRequest');
    },

    onMakeGetRequest: function(url) {
        // Assume `request` is some HTTP library (e.g. superagent)
        request.get(url, function(err, res) {
            if (err) {
                return makeGetRequest.failed(err);
            }
            makeGetRequest.completed(body);
        })
    }
});
```

You could use promises to make the request and either render or serve an error:

```javascript
makeGetRequest.triggerAsync('/api/something').then(function(body) {
    // Render the response body
}).catch(function(err) {
    // Handle the API error object
});
```

## Colophon

[List of contributors](https://github.com/reflux/reflux-promise/graphs/contributors) is available on Github.

This project is licensed under [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause). Copyright (c) 2014, Mikael Brassman.

For more information about the license for this particular project [read the LICENSE.md file](LICENSE.md).
