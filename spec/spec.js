/* jshint -W070 */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
    'underscore',
    'knockout',
    'knockout-combinators',
    'chai'
], function(_, ko, kc, chai) {
    'use strict';

    // TODO: use claire (QuickCheck) generators throughout
    // Also, more tests

    var u = ko.utils.unwrapObservable,
        o = ko.observable,
        c = ko.computed,
        expect = chai.expect,
        assert = chai.expect;

    describe('kc.object', function() {
        it('Lifts all the input observables to the top level', function() {

            var input = { foo: o('baz'), bizzle: o('bozzle') };
            var output = kc.object(input);

            expect(output()).to.deep.equal({ foo: 'baz', bizzle: 'bozzle' });

            input.foo('bar');

            expect(output()).to.deep.equal({ foo: 'bar', bizzle: 'bozzle' });
        });
    });

    describe('kc.fields', function() {
        it('Creates an object full of observables watching each fields of the input obs', function() {

            var input = o({foo: 'baz', bizzle: 'bozzle'});
            var output = kc.fields(input);

            _(input()).each(function(value, key) { expect(output[key]()).to.equal(value); });
            
            input({foo: 'bar', bizzle: 'bozzle'});
            
            _(input()).each(function(value, key) { expect(output[key]()).to.equal(value); });
        });
    });

    describe('kc.every', function() {
        it('Is true when all the contained bits are true', function() {
            expect(kc.every([o(true), o(true), o(true)])()).to.equal(true);
        });
        
        it('Is false when any of the contained bits are false', function() {
            expect(kc.every([o(true), o(false), o(true)])()).to.equal(false);
        });

        it('Sets all the contained bits on write', function() {
            var input = [o(true), o(false), o(true)];
            var output = kc.every(input);

            output(false);
            _(input).each(function(obs) { expect(obs()).to.equal(false); });
            output(true);
            _(input).each(function(obs) { expect(obs()).to.equal(true); });
        });
    });
    
    describe('kc.any', function() {
        it('Is true when any of the contained bits are true', function() {
            expect(kc.any([o(false), o(true), o(false)])()).to.equal(true);
        });
        
        it('Is false when all of the contained bits are false', function() {
            expect(kc.any([o(false), o(false), o(false)])()).to.equal(false);
        });

        it('Sets all the contained bits on write', function() {
            var input = [o(true), o(false), o(true)];
            var output = kc.any(input);

            output(false);
            _(input).each(function(obs) { expect(obs()).to.equal(false); });
            output(true);
            _(input).each(function(obs) { expect(obs()).to.equal(true); });
        });
    });

    describe('kc.toggle', function() {
        it('Flips the boolean value of an observable', function() {
            var input = o(true);
            var output = kc.toggle(input);
            
            expect(input()).to.equal(true);
            output();
            expect(input()).to.equal(false);
            output();
            expect(input()).to.equal(true);
        });
    });

    describe('kc.toggleField', function() {
        it('Flips the boolean observable of a particular field of its input', function() {
            var input = { foo: o(true) };
            var fn = kc.toggleField('foo');
            
            expect(input.foo()).to.equal(true);
            fn(input);
            expect(input.foo()).to.equal(false);
            fn(input);
            expect(input.foo()).to.equal(true);
        });
    });

    describe('kc.monotonicObject', function() {
        it('Needs more tests!', function() { });
    });

    describe('kc.deepUnwrap', function() {
        it('Unwraps observables everywhere', function() {
            expect(kc.deepUnwrap(o(true))).to.equal(true);
            expect(kc.deepUnwrap({ foo: o('baz'), bizzle: o('bozzle') })).to.deep.equal({ foo: 'baz', bizzle: 'bozzle' });
            expect(kc.deepUnwrap({ foo: o('baz'), bizzle: { bing: o('bozzle') } })).to.deep.equal({ foo: 'baz', bizzle: {bing: 'bozzle'} })
        });
    });

    describe('kc.wrap', function() {
        it('Needs more tests!', function() { });
    });
    
    describe('kc.monitor', function() {
        it('Needs more tests!', function() { });
    });
});
