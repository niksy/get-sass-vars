'use strict';

const assert = require('assert');
const fs = require('fs');
const pify = require('pify');
const fn = require('../');

it('should create JSON object from Sass variables', function () {

	const expected = require('./fixtures/basic.expected.json');

	return pify(fs.readFile)('./test/fixtures/index.scss', 'utf-8')
		.then(( res ) => {
			return fn(res);
		})
		.then(( actual ) => {
			assert.deepEqual(actual, expected);
		});

});

it('should camelcase Sass variable names and use them as JSON object keys', function () {

	const expected = require('./fixtures/camelcase.expected.json');

	return pify(fs.readFile)('./test/fixtures/index.scss', 'utf-8')
		.then(( res ) => {
			return fn(res, { camelize: true });
		})
		.then(( actual ) => {
			assert.deepEqual(actual, expected);
		});

});

it('should use provided Sass options for Sass rendering', function () {

	const expected = require('./fixtures/sass-options.expected.json');

	return pify(fs.readFile)('./test/fixtures/index.scss', 'utf-8')
		.then(( res ) => {
			return fn(res, {
				sassOptions: {
					precision: 2
				}
			});
		})
		.then(( actual ) => {
			assert.deepEqual(actual, expected);
		});

});
