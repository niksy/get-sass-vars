import stripOuter from 'strip-outer';
import camelcaseKeys from 'camelcase-keys';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import * as sass from 'sass';
import jsonFns from 'node-sass-json-functions';
import fromEntries from '@ungap/from-entries';

/**
 * @typedef {JsonPrimitive | JsonObject | JsonArray} JsonValue
 * @typedef {JsonValue[]} JsonArray
 * @typedef {string | number | boolean | null} JsonPrimitive
 * @typedef {{[Key in string]?: JsonValue}} JsonObject
 */

/**
 * @typedef {object} Options
 * @property {boolean=}               camelize    Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).
 * @property {sass.Options<"async">=} sassOptions Options for Sass renderer.
 */

/**
 * @typedef {object} SyncOptions
 * @property {boolean=}              camelize    Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).
 * @property {sass.Options<"sync">=} sassOptions Options for Sass renderer.
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
		sassOptions = /** @type {sass.Options<"async">} */ ({})
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
			node.append(getEncodedValueNode(decl));
		}
	});
	initialRoot.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	let sassResponse = await sass.compileStringAsync(initialRoot.toString(), {
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
			let [property, value] = decl.value.split(' ":" ');
			property = stripOuter(property, '"');
			value = stripOuter(value, '"');
			value = stripOuter(value, "'");
			data[property] = JSON.parse(value);
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
		sassOptions = /** @type {sass.Options<"sync">} */ ({})
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
			node.append(getEncodedValueNode(decl));
		}
	});
	initialRoot.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	let sassResponse = sass.compileString(initialRoot.toString(), {
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
			let [property, value] = decl.value.split(' ":" ');
			property = stripOuter(property, '"');
			value = stripOuter(value, '"');
			value = stripOuter(value, "'");
			data[property] = JSON.parse(value);
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
