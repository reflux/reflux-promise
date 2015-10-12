var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('reflux-core'),
    RefluxPromise = require('../lib'),
    Q = require('q'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating actions using promises', function() {

    Reflux.use(RefluxPromise(Q.Promise));

    describe('with children to an action definition object', function() {
        var actionNames, actions;

        beforeEach(function () {
            actionNames = {'foo': {asyncResult: true}, 'bar': {children: ['baz']}};
            actions = Reflux.createActions(actionNames);
        });

        describe('when promising an async action created this way', function() {
            var promise;

            beforeEach(function() {
                // promise resolves on foo.completed
                promise = Q.promise(function(resolve) {
                    actions.foo.completed.listen(function(){
                        resolve.apply(null, arguments);
                    }, {}); // pass empty context
                });

                // listen for foo and return a promise
                actions.foo.listenAndPromise(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    var deferred = Q.defer();

                    setTimeout(function() {
                        deferred.resolve(args);
                    }, 0);

                    return deferred.promise;
                });
            });

            it('should invoke the completed action with the correct arguments', function() {
                var testArgs = [1337, 'test'];
                actions.foo(testArgs[0], testArgs[1]);

                return assert.eventually.deepEqual(promise, testArgs);
            });
        });
    });

    describe('Creating multiple actions from an mixed array of strings and object definitions', function() {

        var actionNames, actions;

        beforeEach(function () {
            actionNames = [
                'foo',
                'bar',
                { baz: { asyncResult: true, children: ['woo'] }},
                {
                    anotherFoo: { asyncResult: true },
                    anotherBar: { children: ['wee'] }
                }];
            actions = Reflux.createActions(actionNames);
        });

        describe('when promising an async action created this way', function() {
            var promise;

            beforeEach(function() {
                // promise resolves on baz.completed
                promise = Q.promise(function(resolve) {
                    actions.baz.completed.listen(function(){
                        resolve.apply(null, arguments);
                    }, {}); // pass empty context
                });

                // listen for baz and return a promise
                actions.baz.listenAndPromise(function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    var deferred = Q.defer();

                    setTimeout(function() {
                        deferred.resolve(args);
                    }, 0);

                    return deferred.promise;
                });
            });

            it('should invoke the completed action with the correct arguments', function() {
                var testArgs = [1337, 'test'];
                actions.baz(testArgs[0], testArgs[1]);

                return assert.eventually.deepEqual(promise, testArgs);
            });
        });
    });

});
