var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('reflux-core'),
    refluxPromise = require('../lib'),
    Q = require('q'),
    sinon = require('sinon'),
    util = require('util');

chai.use(require('chai-as-promised'));

describe("using the publisher methods mixin",function(){

    Reflux.use(refluxPromise(Q.Promise));
    var pub = Reflux.PublisherMethods;

    describe("the promise method",function(){

        describe("when the promise completes",function(){
            var deferred = Q.defer(),
                promise = deferred.promise,
                context = {
                    children:['completed','failed'],
                    completed:sinon.spy(),
                    failed:sinon.spy()
                },
                result = pub.promise.call(context,promise);

            deferred.resolve('foo');

            it("should not return a value",function(){
                assert.equal(result, undefined);
            });

            it("should call the completed child trigger",function(){
                var args = context.completed.firstCall.args;
                assert.deepEqual(args, ["foo"]);
            });

            it("should not call the failed child trigger",function(){
                assert.equal(context.failed.callCount, 0);
            });
        });

        describe("when the promise fails",function(){
            var deferred = Q.defer(),
                promise = deferred.promise,
                context = {
                    children:['completed','failed'],
                    completed:sinon.spy(),
                    failed:sinon.spy()
                },
                result = pub.promise.call(context,promise);

            deferred.reject('bar');

            it("should not return a value",function(){
                assert.equal(result, undefined);
            });

            it("should call the failed child trigger",function(){
                var args = context.failed.firstCall.args;
                assert.deepEqual(args, ["bar"]);
            });

            it("should not the completed child trigger",function(){
                assert.equal(context.completed.callCount, 0);
            });
        });
    });

    describe("the triggerAsync method",function(){
        it("should not require completed & failed actions", function() {
            var contexts = [
                { children: [] },
                { children: ['completed'] },
                { children: ['failed'] },
            ];

            contexts.forEach(function(context){
                pub.triggerAsync.call(context);
                assert(true);
            });
        });

        it("should return a promise",function(){
            var context = {
                children:['completed','failed'],
                completed:sinon.spy(),
                failed:sinon.spy()
            };

            var promise = pub.triggerAsync.call(context);

            assert.isFulfilled(promise);
        });

        it("should resolve when completed",function(){
            var action = Reflux.createAction({ asyncResult: true });

            Reflux.createStore({
                init: function() {
                    this.listenTo(action, this.onAction);
                },
                onAction: function(verb, noun) {
                    setTimeout(function() {
                        action.completed(util.format('%s %s completed', verb, noun));
                    }, 10);
                },
            });

            var promise = action.triggerAsync('do', 'something');

            return assert.becomes(promise, 'do something completed');
        });

        it("should reject when failed",function(){
            var action = Reflux.createAction({ asyncResult: true });

            Reflux.createStore({
                init: function() {
                    this.listenTo(action, this.onAction);
                },
                onAction: function(verb, noun) {
                    setTimeout(function() {
                        action.failed(util.format('%s %s faiiled', verb, noun));
                    }, 10);
                },
            });

            var promise = action.triggerAsync('do', 'something');

            return assert.isRejected(promise, 'do something failed');
        });

        it("should resolve with the promised result",function(){
            var makePancakes = Reflux.createAction({ asyncResult: true });
            makePancakes.listenAndPromise(function (flour, milk, egg) {
              return Q.promise(function(resolve) {
                setTimeout(function(){
                  resolve(flour + milk + egg);
                }, 200);
              });
            });

            makePancakes.triggerAsync(2,1,1);

            var morePancakes = makePancakes.triggerAsync(4,2,1);

            return assert.becomes(morePancakes, 7, 'became a different result');
        });
    });
});
