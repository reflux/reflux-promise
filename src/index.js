function createFunctions(Reflux, promiseFactory) {

    const _ = Reflux.utils;

    /**
     * Returns a Promise for the triggered action
     *
     * @return {Promise}
     *   Resolved by completed child action.
     *   Rejected by failed child action.
     *   If listenAndPromise'd, then promise associated to this trigger.
     *   Otherwise, the promise is for next child action completion.
     */
    function triggerPromise() {
        var me = this;
        var args = arguments;

        var canHandlePromise =
            this.children.indexOf("completed") >= 0 &&
            this.children.indexOf("failed") >= 0;

        var promise = new promiseFactory(function(resolve, reject) {
            // If `listenAndPromise` is listening
            // patch `promise` w/ context-loaded resolve/reject
            if (me.willCallPromise) {
                _.nextTick(function() {
                    var previousPromise = me.promise;
                    me.promise = function (inputPromise) {
                        inputPromise.then(resolve, reject);
                        // Back to your regularly schedule programming.
                        me.promise = previousPromise;
                        return me.promise.apply(me, arguments);
                    };
                    me.trigger.apply(me, args);
                });
                return;
            }

            if (canHandlePromise) {
                var removeSuccess = me.completed.listen(function(argsArr) {
                    removeSuccess();
                    removeFailed();
                    resolve(argsArr);
                });

                var removeFailed = me.failed.listen(function(argsArr) {
                    removeSuccess();
                    removeFailed();
                    reject(argsArr);
                });
            }

            me.trigger.apply(me, args);

            if (!canHandlePromise) {
                resolve();
            }
        });

        return promise;
    }

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} The promise to attach to
     */
    function promise(promise) {
        var me = this;

        var canHandlePromise =
            this.children.indexOf("completed") >= 0 &&
            this.children.indexOf("failed") >= 0;

        if (!canHandlePromise){
            throw new Error("Publisher must have \"completed\" and \"failed\" child publishers");
        }

        promise.then(function(response) {
            return me.completed(response);
        }, function(error) {
            return me.failed(error);
        });
    }

    /**
     * Subscribes the given callback for action triggered, which should
     * return a promise that in turn is passed to `this.promise`
     *
     * @param {Function} callback The callback to register as event handler
     */
    function listenAndPromise(callback, bindContext) {
        var me = this;
        bindContext = bindContext || this;
        this.willCallPromise = (this.willCallPromise || 0) + 1;

        var removeListen = this.listen(function() {

            if (!callback) {
                throw new Error("Expected a function returning a promise but got " + callback);
            }

            var args = arguments,
                promise = callback.apply(bindContext, args);
            return me.promise.call(me, promise);
        }, bindContext);

        return function () {
          me.willCallPromise--;
          removeListen.call(me);
        };

    }

    return {
        triggerPromise: triggerPromise,
        promise: promise,
        listenAndPromise: listenAndPromise
    };
}

/**
 * Sets up reflux with Promise functionality
 */
export default function(promiseFactory) {
    return function(Reflux) {
        const { triggerPromise, promise, listenAndPromise } = createFunctions(Reflux, promiseFactory);
        Reflux.PublisherMethods.triggerAsync = triggerPromise;
        Reflux.PublisherMethods.promise = promise;
        Reflux.PublisherMethods.listenAndPromise = listenAndPromise;
    };
}
