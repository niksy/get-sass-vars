import stripOuter from 'strip-outer';
import camelcaseKeys from 'camelcase-keys';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
// eslint-disable-next-line import/no-namespace
import * as sass from 'sass';
import jsonFns from 'node-sass-json-functions';
// @ts-ignore
import replaceAll from 'string-replace-all-ponyfill';

/**
 * @import {Options as SassOptions} from 'sass'
 */

/**
 * @typedef {JsonPrimitive | JsonObject | JsonArray} JsonValue
 * @typedef {JsonValue[]} JsonArray
 * @typedef {string | number | boolean | null} JsonPrimitive
 * @typedef {{[Key in string]?: JsonValue}} JsonObject
 */

/**
 * @template {'sync'|'async'} T
 * @typedef {object} Options
 * @property {boolean=}          camelize  Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).
 * @property {SassOptions<T>=} sassOptions Options for Sass renderer.
 */

const sassVariableSelector = '.__sassVars__';
const sassVariableDeclarationRegex = /^\$/;

const noop = () => ({
	postcssPlugin: '_noop'
});

/**
 * @param {import('postcss').Declaration} decl
 */
function getEncodedValueNode(decl) {
	return {
		prop: 'content',

		/*
		 * Decl.prop as property is wrapped inside quotes so it doesn’t get transformed with Sass
		 * decl.prop as value will be transformed with Sass
		 */
		value: `"${decl.prop}" ":" json-encode(${decl.prop}, $quotes: false)`
	};
}

/**
 * @param {string} value
 */
function sanitizeValue(value) {
	value = stripOuter(value, '"');
	value = stripOuter(value, "'");
	value = replaceAll(value, '\\\\', '\\');
	value = value.replace(/^\\"(.+)\\"$/, '"$1"');
	value = replaceAll(value, '\\\\', '\\');
	return value;
}

/**
 * Gets Sass variables from Sass string.
 *
 * Only top-level variables will be considered, anything inside selector or at-rule is ignored.
 *
 * @param {string}            input
 * @param {Options<'async'>=} options
 */
async function main(input, options) {
	const { camelize = false, sassOptions = /** @type {SassOptions<'async'>} */ ({}) } =
		options || {};

	const cssProcessor = postcss([noop()]);

	/* eslint-disable no-undefined */
	const initialResponse = await cssProcessor.process(input, {
		syntax: postcssScss,
		from: undefined
	});
	const initialRoot = initialResponse.root;

	const node = postcss.rule({
		selector: sassVariableSelector
	});

	initialRoot.walkDecls(sassVariableDeclarationRegex, (decl) => {
		if (decl.parent === initialRoot) {
			node.append(getEncodedValueNode(decl));
		}
	});
	initialRoot.append(node);

	const { functions, silenceDeprecations, ...otherSassOptions } = sassOptions;

	let sassResponse = await sass.compileStringAsync(initialRoot.toString(), {
		functions: { ...jsonFns, ...functions },
		...otherSassOptions,
		// eslint-disable-next-line unicorn/prefer-spread
		silenceDeprecations: Array.from(new Set([...(silenceDeprecations || []), 'color-4-api']))
	});

	let sassResponseString = typeof sassResponse === 'undefined' ? '' : sassResponse.css.toString();

	const finalResponse = await cssProcessor.process(sassResponseString, {
		from: undefined
	});
	const finalRoot = finalResponse.root;

	/** @type {JsonObject} */
	const data = {};

	finalRoot.walkRules(sassVariableSelector, (rule) => {
		rule.walkDecls('content', (decl) => {
			let [property, value] = /** @type [string, string] */ (decl.value.split(' ":" '));
			property = stripOuter(property, '"');
			value = sanitizeValue(value);
			data[property] = JSON.parse(value);
		});
	});

	if (camelize) {
		return /** @type {JsonObject} */ (
			camelcaseKeys(
				Object.fromEntries(
					Object.entries(data).map(([key, value]) => [stripOuter(key, '$'), value])
				)
			)
		);
	}
	return data;
}

/**
 * @param {string}           input
 * @param {Options<'sync'>=} options
 */
function mainSync(input, options) {
	const { camelize = false, sassOptions = /** @type {SassOptions<'sync'>} */ ({}) } =
		options || {};

	const cssProcessor = postcss([noop()]);

	/* eslint-disable no-undefined */
	const initialResponse = cssProcessor.process(input, {
		syntax: postcssScss,
		from: undefined
	});
	const initialRoot = initialResponse.root;

	const node = postcss.rule({
		selector: sassVariableSelector
	});

	initialRoot.walkDecls(sassVariableDeclarationRegex, (decl) => {
		if (decl.parent === initialRoot) {
			node.append(getEncodedValueNode(decl));
		}
	});
	initialRoot.append(node);

	const { functions, silenceDeprecations, ...otherSassOptions } = sassOptions;

	let sassResponse = sass.compileString(initialRoot.toString(), {
		// @ts-ignore
		functions: { ...jsonFns, ...functions },
		...otherSassOptions,
		// eslint-disable-next-line unicorn/prefer-spread
		silenceDeprecations: Array.from(new Set([...(silenceDeprecations || []), 'color-4-api']))
	});

	let sassResponseString = typeof sassResponse === 'undefined' ? '' : sassResponse.css.toString();

	const finalResponse = cssProcessor.process(sassResponseString, {
		from: undefined
	});
	const finalRoot = finalResponse.root;

	/** @type {JsonObject} */
	const data = {};

	finalRoot.walkRules(sassVariableSelector, (rule) => {
		rule.walkDecls('content', (decl) => {
			let [property, value] = /** @type [string, string] */ (decl.value.split(' ":" '));
			property = stripOuter(property, '"');
			value = sanitizeValue(value);
			data[property] = JSON.parse(value);
		});
	});

	if (camelize) {
		return /** @type {JsonObject} */ (
			camelcaseKeys(
				Object.fromEntries(
					Object.entries(data).map(([key, value]) => [stripOuter(key, '$'), value])
				)
			)
		);
	}
	return data;
}

/**
 * Gets Sass variables from Sass string. Sync version.
 *
 * Only top-level variables will be considered, anything inside selector or at-rule is ignored.
 */
main.sync = mainSync;

export default main;
