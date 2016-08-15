var assert = require('assert');
var fs = require('fs');
var pify = require('pify');
var fn = require('../');

it('should create JSON object from Sass variables', function () {

	var expected = require('./fixtures/basic.expected.json');

	return pify(fs.readFile)('./test/fixtures/index.scss', 'utf-8')
		.then(function ( res ) {
			return fn(res);
		})
		.then(function ( actual ) {
			assert.deepEqual(actual, expected);
		});

});

it('should camelcase Sass variable names and use them as JSON object keys', function () {

	var expected = require('./fixtures/camelcase.expected.json');

	return pify(fs.readFile)('./test/fixtures/index.scss', 'utf-8')
		.then(function ( res ) {
			return fn(res, { camelize: true });
		})
		.then(function ( actual ) {
			assert.deepEqual(actual, expected);
		});

});
