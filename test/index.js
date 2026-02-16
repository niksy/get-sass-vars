import assert from 'node:assert';
import _fs, { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import loadJsonFile from 'load-json-file';
import function_ from '../index.js';

/**
 * @import {Options} from '../index.js'
 */

/**
 * @param {string}  file
 * @param {Options<'async'>} [options]
 */
async function processStyle(file, options) {
	const response = await fs.readFile(file, 'utf8');
	const sassOptions = options ? options.sassOptions || {} : {};
	const actual = await function_(response, {
		...options,
		sassOptions: {
			...sassOptions,
			silenceDeprecations: [
				...(sassOptions.silenceDeprecations || []),
				'color-functions',
				'global-builtin'
			]
		}
	});
	return actual;
}

/**
 * @param {string}      file
 * @param {Options<'sync'>} [options]
 */
function processStyleSync(file, options) {
	const response = _fs.readFileSync(file, 'utf8');
	const sassOptions = options ? options.sassOptions || {} : {};
	const actual = function_.sync(response, {
		...options,
		sassOptions: {
			...sassOptions,
			silenceDeprecations: [
				...(sassOptions.silenceDeprecations || []),
				'color-functions',
				'global-builtin'
			]
		}
	});
	return actual;
}

describe('Async', function () {
	it('should create JSON object from Sass variables', async function () {
		const [expected, actual] = await Promise.all([
			loadJsonFile(fileURLToPath(new URL('./fixtures/basic.expected.json', import.meta.url))),
			processStyle('./test/fixtures/index.scss')
		]);

		assert.deepEqual(actual, expected);
	});

	it('should camelcase Sass variable names and use them as JSON object keys', async function () {
		const [expected, actual] = await Promise.all([
			loadJsonFile(
				fileURLToPath(new URL('./fixtures/camelcase.expected.json', import.meta.url))
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
				fileURLToPath(new URL('./fixtures/basic.expected.json', import.meta.url))
			),
			processStyleSync('./test/fixtures/index.scss')
		];

		assert.deepEqual(actual, expected);
	});

	it('should camelcase Sass variable names and use them as JSON object keys', function () {
		const [expected, actual] = [
			loadJsonFile.sync(
				fileURLToPath(new URL('./fixtures/camelcase.expected.json', import.meta.url))
			),
			processStyleSync('./test/fixtures/index.scss', { camelize: true })
		];

		assert.deepEqual(actual, expected);
	});
});
