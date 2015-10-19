# `PublisherMethods`

Extensions are made in `PublisherMethods`. Both Actions and Stores will have the following methods mixed in.

## `PublisherMethods.listenAndPromise()`

Expects a function that returns a promise object, which is called when the action is triggered, after which `promise` is called with the returned promise object. Essentially calls the function on trigger of the action, which then triggers the `completed` or `failed` child actions after the promise is fulfilled.

## `PublisherMethods.promise()`

Expects a promise object and binds the triggers of the `completed` and `failed` child actions to that promise, using `then()` and `catch()`.

## `PublisherMethods.triggerAsync()`

Is overriding `reflux-core`'s default implementation. The method will return a promise.
