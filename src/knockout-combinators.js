if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    'knockout',
    'underscore'
], 
function(ko, _) {
    "use strict";

    var kc = {},
         u = ko.utils.unwrapObservable,
         o = ko.observable,
         c = ko.computed,
         die = function(msg) { throw new Error(msg); };

    ///// τ obslike a = (observable a) or a
    //
    // Many functions can operate on either an observable or a raw value.
    // This is called 'obslike' here.

    ///// λ mapValues :: (a -> b) -> {a} -> {b}
    //
    // The standard definition of `map` on dictionaries, rejected by
    // underscore's maintainers, for now. 
    // (see https://github.com/documentcloud/underscore/issues/220#issuecomment-12112759)
   
    _.mixin({
        mapValues: function(obj, f) {
            return _.reduce(obj, function(newObj, v, k) {
                newObj[k] = f(v, k, obj);
                return newObj;
            }, {});
        }
    });
    
    ///// λ object :: {obs *} -> obs {*}
    //
    // i.e. Label -> (Time -> Value)  ==>  Time -> (Label -> Value)
    //
    // This is an isomorphism in the read-only case if the set of 
    // labels does not change (this restriction is because the set 
    // of labels is finite).
    //
    // It is currently an error to write an object to the output
    // observable with keys that do not appear in the input.
    //
    // See also the "inverse", kc.fields

    kc.object = function(objectOfObservables) {
        return c({
            read: function() {
                return _(objectOfObservables).mapValues(function(obs) { return obs() });
            },
            write: function(newObj) {
                _(newObj).each(function(value, key) { objectOfObservables[key](value); });
            }
        });
    }

    ///// λ fields :: obs {*} -> {obs *}
    //
    // i.e. Time -> (Label -> Value)  ==>  Label -> (Time -> Value)
    //
    // See also the "inverse", kc.object

    kc.fields = function(observableOfObject) {
        return _.chain( u(observableOfObject) )
            .keys()
            .map(function(key) {
                return [key, c(function() { return u(u(observableOfObject)[key]); })];
            })
            .object()
            .value();
    }
        
    ///// λ every :: obslike [obslike Boolean] -> obs Boolean
    //
    // A ready/write observable that is `true` exactly when 
    // all the observables in the input list are `true`.
    //
    // When written, it writes all the observables. It is
    // actually identical to `kc.any` when writing, but
    // when attached to a toggle is somewhat dual.
    //
    // It is an error to try to write when there are read-only
    // observables or values in the input.

    kc.every = function(obsArray) {
        return ko.computed({
            read: function() { return _(u(obsArray)).every(function(obs) { return u(obs); }); },
            write: function(value) { _(u(obsArray)).each(function(obs) { obs(value); }); }
        });
    }
    
    ///// λ any :: obslike [obslike Boolean] -> obs Boolean
    //
    // A ready/write observable that is `true` exactly when 
    // any of the observables in the input list are `true`.
    //
    // When written, it writes all the observables. It is
    // actually identical to `kc.every` when writing, but
    // when attached to a toggle is somewhat dual.
    //
    // It is an error to try to write when there are read-only
    // observables or values in the input.

    kc.any = function(obsArray) {
        return ko.computed({
            read: function() { return _(u(obsArray)).any(function(obs) { return u(obs); }); },
            write: function(value) { _(u(obsArray)).each(function(obs) { obs(value); }); }
        });
    }
    
    ///// λ sum :: obslike [obslike Number] -> obs Number
    //
    // Sums the observable in the array
    
    kc.sum = function(obsArray) {
        return c(function() { return _(u(obsArray)).reduce(function(partialSum, obslike) { return partialSum + u(obslike); }, 0) });
    }

    ///// λ toggle :: obs -> (() -> ())
    //
    // A callback that toggles an observable.

    kc.toggle = function(obs) {
        return function() {
            var curr = u(obs);
            obs(!curr);
        };
    }
    
    ///// λ toggleField :: String -> (() -> ())
    //
    // A callback that toggles a particular field on
    // the viewModel context.

    kc.toggleField = function(field) {
        return function(viewModel) {
            kc.toggle(viewModel[field])();
        };
    }

    ///// λ validated :: ... -> Observable ({ok: a} | {error: b})
    //
    // Like ko.computed, but the underlying observable is expected to return something
    // like `Either a b` as specified in the signature. Then it allows some chaining

    kc.validated = function(options) {
        var underlying_observable = ko.computed(options); /* Must return {'errors': [...]} or {'ok': ...}  */

        underlying_observable.andThen = function(otherValidated) {
            // This is the Either monad for a monoid of error message, sorta
            return ko.validated(function() {
                var val = underlying_observable();
                if ( _(val).has('ok') ) {
                    return otherValidated(); // Which will either be 'ok' or 'errors' as well.
                } else {
                    return val; // Which must be {'errors': [ ... ]}
                }
            });
        };

        underlying_observable.implies = function(otherValidated) {
            return ko.validated(function() {
                var val = underlying_observable();
                if ( _(val).has('ok') ) {
                    return otherValidated();
                } else {
                    return { 'ok': null }
                }
            });
        }
        
        underlying_observable.orElse = function(otherValidated) {
            return ko.validated(function() {
                var val = underlying_observable();
                if ( _(val).has('ok') ) {
                    return val;
                } else {
                    return otherValidated();
                }
            });
        }

        return underlying_observable;
    };
    
    ///// λ monotonicObject :: { source: obslike [a], getKey: (a -> String), getValue: (a -> b)? } -> obs {b}
    //
    // An observable that monitors the input `source` array and whenever a new item come in,
    // call it `x`, adds `value(x)` as the output object's field `key(x)`. If getValue is omitted,
    // it will default to the identity function.
    //
    // The _monotonic_ requirement means that it only gathers information but will never overwrite
    // or remove a field from the output object. It is particularly well suited to fetching many
    // arrays of remote data and saving them w/out duplication.
    
    kc.monotonicObject = function(args) {
        var source   = args.source || die('Missing required arg `source` for `monotonicObject`');
        var getKey   = args.getKey || die('Missing required arg `getKey` for `monotonicObject`');
        var getValue = args.getValue || function(x) { return x; };

        var underlyingObject = {};
        var underlyingObservable = o(underlyingObject);

        c(function() {
            var hasMutated = false;

            _(u(source)).each(function(item) {
                var key = getKey(item);
                if ( _(underlyingObject).has(key) ) return;
                underlyingObject[key] = getValue(item);
                hasMutated = true;
            });

            if ( hasMutated ) underlyingObservable.valueHasMutated();
        });

        return underlyingObservable;
    }
    
    ///// λ wrapObservable :: (a | Observable a) -> Observable a
    //
    // Creates an observable if not already.

    kc.wrapObservable = function(v) {
        return ko.isObservable(v) ? v : ko.observable(v);
    };
    
    
    ///// λ map :: (a -> b) -> Observable a -> Observable b
    //
    // Curried map of the Observable functor

    kc.map = function(f) {
        return function(obs) {
            return ko.computed(function() {
                return f(obs());
            });
        };
    },


    
    ///// λ deepUnwrap :: * -> Number? -> *
    //
    // Traverses an object and aggressively unwraps all observables found 
    // up to the given depth, or 100.
    //
    // Most useful for logging, since if an observable is logged and changes
    // after the log message, the devtools log output will have been mutated,
    // leaving inaccurate information.

    kc.deepUnwrap = function(v, depth) {
        depth = depth || 0;
        if ( depth >= 100 ) return 'Max depth: 100';
        
        if ( ko.isObservable(v) ) {
            return kc.deepUnwrap( v(), depth+1 );
        } else if ( _(v).isArray() ) {
            return _(v).map(function(elem) { return kc.deepUnwrap(elem, depth+1); });
        } else if ( _(v).isDate() ) {
            return v;
        } else if ( _(v).isObject() ) {
            var new_v = {};
            _(v).each(function(val, key) { new_v[key] = kc.deepUnwrap(val, depth+1) });
            return new_v;
        } else {
            return v;
        }
    };
    
    ///// λ wrap :: obs a or a -> obs a
    //
    // Wraps a value with an observable if it is not one already.

    kc.wrap = function(v) {
        return ko.isObservable(v) ? v : o(v);
    };

    ///// λ monitor :: ... -> ()
    //
    // Logs every change to its arguments (deeply unwrapped) on the console.
    // Throttled to 100ms since this can be overwhelming in the case of synchronous
    // updates.

    kc.monitor = function() {
        var args = arguments.length === 1 ? arguments[0] : arguments;
        c(function() {
            console.log(kc.deepUnwrap(args), args);
        }).extend({throttle: 100});
    };
    
    return kc;
});

