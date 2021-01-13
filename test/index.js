import assert from 'assert';
import { promises as fs } from 'fs';
import path from 'path';
import loadJsonFile from 'load-json-file';
import function_ from '../index';

async function processStyle(file, options = {}) {
	const response = await fs.readFile(file, 'utf-8');
	const actual = await function_(response, options);
	return actual;
}

it('should create JSON object from Sass variables', async function () {
	const [expected, actual] = await Promise.all([
		loadJsonFile(path.resolve(__dirname, './fixtures/basic.expected.json')),
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

it('should use provided Sass options for Sass rendering', async function () {
	const [expected, actual] = await Promise.all([
		loadJsonFile(
			path.resolve(__dirname, './fixtures/sass-options.expected.json')
		),
		processStyle('./test/fixtures/index.scss', {
			sassOptions: {
				precision: 2
			}
		})
	]);

	assert.deepEqual(actual, expected);
});
