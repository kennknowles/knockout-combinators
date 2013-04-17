
BIN=node_modules/.bin
MOCHA=$(BIN)/mocha
ISTANBUL=$(BIN)/istanbul
JSHINT=$(BIN)/jshint

#
# .PHONY targets for the command-line
#

.PHONY: jshint
jshint:
	$(JSHINT) --verbose src

.PHONY: test
test: jshint
	$(MOCHA) --reporter dot ./spec/mocha-spec-runner.js

.PHONY: coverage
coverage: jshint lib-cov
	KC_PATH=lib-cov/knockout-combinators $(MOCHA) --reporter mocha-istanbul ./spec/mocha-spec-runner.js

#
# Actual file targets
#

lib-cov: src/knockout-combinators.js
	rm -rf lib-cov
	mkdir -p lib-cov
	$(ISTANBUL) instrument --output lib-cov --no-compact --variable global.__coverage__ src
