import assert from 'assert';
import _fs, { promises as fs } from 'fs';
import path from 'path';
import loadJsonFile from 'load-json-file';
import function_ from '../index';

/**
 * @typedef {import('../index').Options} Options
 * @typedef {import('../index').SyncOptions} SyncOptions
 */

/**
 * @param {string}  file
 * @param {Options} [options]
 */
async function processStyle(file, options) {
	const response = await fs.readFile(file, 'utf-8');
	const actual = await function_(response, options);
	return actual;
}

/**
 * @param {string}      file
 * @param {SyncOptions} [options]
 */
function processStyleSync(file, options) {
	const response = _fs.readFileSync(file, 'utf-8');
	const actual = function_.sync(response, options);
	return actual;
}

describe('Async', function () {
	it('should create JSON object from Sass variables', async function () {
		const [expected, actual] = await Promise.all([
			loadJsonFile(
				path.resolve(__dirname, './fixtures/basic.expected.json')
			),
			processStyle('./test/fixtures/index.scss')
		]);

		assert.deepEqual(actual, expected);
	});

	it('should camelcase Sass variable names and use them as JSON object keys', async function () {
		const [expected, actual] = await Promise.all([
			loadJsonFile(
				path.resolve(__dirname, './fixtures/camelcase.expected.json')
			),
			processStyle('./test/fixtures/index.scss', { camelize: true })
		]);

		assert.deepEqual(actual, expected);
	});
});

describe('Sync', function () {
	it('should create JSON object from Sass variables', function () {
		const [expected, actual] = [
			loadJsonFile.sync(
				path.resolve(__dirname, './fixtures/basic.expected.json')
			),
			processStyleSync('./test/fixtures/index.scss')
		];

		assert.deepEqual(actual, expected);
	});

	it('should camelcase Sass variable names and use them as JSON object keys', function () {
		const [expected, actual] = [
			loadJsonFile.sync(
				path.resolve(__dirname, './fixtures/camelcase.expected.json')
			),
			processStyleSync('./test/fixtures/index.scss', { camelize: true })
		];

		assert.deepEqual(actual, expected);
	});
});
