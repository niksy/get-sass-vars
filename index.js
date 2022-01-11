import { promisify } from 'util';
import stripOuter from 'strip-outer';
import camelcaseKeys from 'camelcase-keys';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import sass from 'sass';
import jsonFns from 'node-sass-json-functions';
import fromEntries from '@ungap/from-entries';

/**
 * @typedef {JsonPrimitive | JsonObject | JsonArray} JsonValue
 * @typedef {JsonValue[]} JsonArray
 * @typedef {string | number | boolean | null} JsonPrimitive
 * @typedef {{[Key in string]?: JsonValue}} JsonObject
 */

/**
 * @typedef {sass.Options<"async">|sass.LegacyOptions<"async">} SassAsyncOptions
 * @typedef {sass.Options<"sync">|sass.LegacyOptions<"sync">} SassSyncOptions
 */

/**
 * @typedef {object} Options
 * @property {boolean=}          camelize    Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).
 * @property {number=}           precision   Number of digits after the decimal.
 * @property {SassAsyncOptions=} sassOptions Options for Sass renderer.
 */

/**
 * @typedef {object} SyncOptions
 * @property {boolean=}         camelize    Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).
 * @property {number=}          precision   Number of digits after the decimal.
 * @property {SassSyncOptions=} sassOptions Options for Sass renderer.
 */

const sassVariableSelector = '.__sassVars__';
const sassVariableDeclarationRegex = /^\$/;

const noop = () => ({
	postcssPlugin: '_noop'
});

/**
 * @param {import('postcss').Declaration} decl
 * @param {number}                        precision
 */
function getEncodedValueNode(decl, precision) {
	return {
		prop: 'content',

		/*
		 * Decl.prop as property is wrapped inside quotes so it doesn’t get transformed with Sass
		 * decl.prop as value will be transformed with Sass
		 */
		value: `"${decl.prop}" ":" json-encode(${decl.prop}, true, ${precision})`
	};
}

/**
 * Gets Sass variables from Sass string.
 *
 * Only top-level variables will be considered, anything inside selector or at-rule is ignored.
 *
 * @param {string}   input   Sass input string.
 * @param {Options=} options
 */
async function main(input, options) {
	const {
		camelize = false,
		precision = 5,
		sassOptions = /** @type {SassAsyncOptions} */ ({})
	} = options || {};

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
			node.append(getEncodedValueNode(decl, precision));
		}
	});
	initialRoot.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	let sassResponse = await promisify(sass.render)({
		data: initialRoot.toString(),
		functions: { ...jsonFns, ...functions },
		...otherSassOptions
	});

	let sassResponseString =
		typeof sassResponse === 'undefined' ? '' : sassResponse.css.toString();

	const finalResponse = await cssProcessor.process(sassResponseString, {
		from: undefined
	});
	const finalRoot = finalResponse.root;

	/** @type {JsonObject} */
	const data = {};

	finalRoot.walkRules(sassVariableSelector, (rule) => {
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

/**
 * Gets Sass variables from Sass string. Sync version.
 *
 * Only top-level variables will be considered, anything inside selector or at-rule is ignored.
 *
 * @param {string}       input   Sass input string.
 * @param {SyncOptions=} options
 */
function mainSync(input, options) {
	const {
		camelize = false,
		precision = 5,
		sassOptions = /** @type {SassSyncOptions} */ ({})
	} = options || {};

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
			node.append(getEncodedValueNode(decl, precision));
		}
	});
	initialRoot.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	let sassResponse = sass.renderSync({
		data: initialRoot.toString(),
		// @ts-ignore
		functions: { ...jsonFns, ...functions },
		...otherSassOptions
	});

	let sassResponseString =
		typeof sassResponse === 'undefined' ? '' : sassResponse.css.toString();

	const finalResponse = cssProcessor.process(sassResponseString, {
		from: undefined
	});
	const finalRoot = finalResponse.root;

	/** @type {JsonObject} */
	const data = {};

	finalRoot.walkRules(sassVariableSelector, (rule) => {
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

main.sync = mainSync;

export default main;
