Knockout-combinators
====================

https://github.com/kennknowles/knockout-combinators

[![Build status](https://travis-ci.org/kennknowles/knockout-combinators.png)](https://travis-ci.org/kennknowles/knockout-combinators)
[![NPM version](https://badge.fury.io/js/knockout-combinators.png)](http://badge.fury.io/js/knockout-combinators)

Utilities to combining & compose Knockout observables

Quick Intro
-----------

 - `kc.fields` explodes an observable of an object into observables for each field.
 - `kc.object` combines an object of observables into an observable of an object.
 - `kc.every` combines a list of observables into one observable that is true whenever they all are.
 - `kc.any` combines a list of observables into one observable that is true whenever any is.
 - `kc.toggle` creates a callback to toggle a `Boolean` observable, useful for `click` bindings.
 - `kc.toggleField` toggles a field of the view model by name.
 - `kc.monotonicObject` builds an object based on values it sees in an observable array (this one is a bit fancier).
 - `kc.deepUnwrap` recursively traverses a value and unwraps all the observables it sees. Especially handy for logging.
 - `kc.wrap` wraps a value in an observable if it is not already.
 - `kc.monitor` logs every change to an observable to the console (throttled as this can be crazy).

See the code itself for more details; each function is really quite small. To be expanded as I scrape these out of my various codebases. Pull request very welcome!

Copyright & License
-------------------

Copyright 2013 Kenneth Knowles

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
