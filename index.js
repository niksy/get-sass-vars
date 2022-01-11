import { promisify } from 'util';
import stripOuter from 'strip-outer';
import camelcaseKeys from 'camelcase-keys';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import sass from 'sass';
import jsonFns from 'node-sass-json-functions';
import fromEntries from '@ungap/from-entries';

const noop = () => ({
	postcssPlugin: '_noop'
});

/**
 * @typedef {JsonPrimitive | JsonObject | JsonArray} JsonValue
 * @typedef {JsonValue[]} JsonArray
 * @typedef {string | number | boolean | null} JsonPrimitive
 * @typedef {{[Key in string]?: JsonValue}} JsonObject
 */

/**
 * @typedef {import('sass').Options} _sass.Options
 */

/**
 * @typedef {object} Options
 * @property {boolean=}       camelize    Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).
 * @property {_sass.Options=} sassOptions Options for Sass renderer.
 */

/**
 * Gets Sass variables from Sass string.
 *
 * Only top-level variables will be considered, anything inside selector or at-rule is ignored.
 *
 * @param {string}   input   Sass input string.
 * @param {Options=} options
 */
async function main(input, options) {
	const { camelize = false, sassOptions = {} } = options || {};

	const cssProcessor = postcss([noop()]);

	/* eslint-disable no-undefined */
	const initialResponse = await cssProcessor.process(input, {
		syntax: postcssScss,
		from: undefined
	});
	const initialRoot = initialResponse.root;

	const node = postcss.rule({
		selector: '.__sassVars__'
	});

	initialRoot.walkDecls(/^\$/, (decl) => {
		if (decl.parent === initialRoot) {
			node.append({
				prop: 'content',

				/*
				 * Decl.prop as property is wrapped inside quotes so it doesn’t get transformed with Sass
				 * decl.prop as value will be transformed with Sass
				 */
				value: `"${decl.prop}" ":" json-encode(${decl.prop})`
			});
		}
	});
	initialRoot.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	const sassResponse = await promisify(sass.render)({
		data: initialRoot.toString(),
		functions: { ...jsonFns, ...functions },
		...otherSassOptions
	});

	const finalResponse = await cssProcessor.process(
		sassResponse.css.toString(),
		{
			from: undefined
		}
	);
	const finalRoot = finalResponse.root;

	/** @type {JsonObject} */
	const data = {};

	finalRoot.walkRules('.__sassVars__', (rule) => {
		rule.walkDecls('content', (decl) => {
			const [property, value] = decl.value.split(' ":" ');
			data[stripOuter(property, '"')] = JSON.parse(
				stripOuter(value, "'")
			);
		});
	});

	if (camelize) {
		return /** @type {JsonObject} */ (
			camelcaseKeys(
				fromEntries(
					Object.entries(data).map(([key, value]) => [
						stripOuter(key, '$'),
						value
					])
				)
			)
		);
	}
	return data;
}

/**.
 * .
 * .
 * .
 * Gets Sass variables from Sass string. (Sync version)
 *
 * @param {string}   input   Sass input string.
 * @param {Options=} options
 */
function sync(input, options) {
	const { camelize = false, sassOptions = {} } = options || {};

	const cssProcessor = postcss([noop()]);

	/* eslint-disable no-undefined */
	const initialResponse = cssProcessor.process(input, {
		syntax: postcssScss,
		from: undefined
	});
	const initialRoot = initialResponse.root;

	const node = postcss.rule({
		selector: '.__sassVars__'
	});

	initialRoot.walkDecls(/^\$/, (decl) => {
		if (decl.parent === initialRoot) {
			node.append({
				prop: 'content',

				/*
				 * Decl.prop as property is wrapped inside quotes so it doesn’t get transformed with Sass
				 * decl.prop as value will be transformed with Sass
				 */
				value: `"${decl.prop}" ":" json-encode(${decl.prop})`
			});
		}
	});
	initialRoot.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	const sassResponse = sass.renderSync({
		data: initialRoot.toString(),
		functions: { ...jsonFns, ...functions },
		...otherSassOptions
	});

	const finalResponse = cssProcessor.process(sassResponse.css.toString(), {
		from: undefined
	});
	const finalRoot = finalResponse.root;

	/** @type {JsonObject} */
	const data = {};

	finalRoot.walkRules('.__sassVars__', (rule) => {
		rule.walkDecls('content', (decl) => {
			const [property, value] = decl.value.split(' ":" ');
			data[stripOuter(property, '"')] = JSON.parse(
				stripOuter(value, "'")
			);
		});
	});

	if (camelize) {
		return /** @type {JsonObject} */ (
			camelcaseKeys(
				fromEntries(
					Object.entries(data).map(([key, value]) => [
						stripOuter(key, '$'),
						value
					])
				)
			)
		);
	}
	return data;
}

main.sync = sync;

export default main;
