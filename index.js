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
 * @param {string} inputCssString
 * @param {object} options
 *
 * @returns {Promise<object>}
 */
export default async (inputCssString, options = {}) => {
	const { camelize = false, sassOptions = {} } = options;

	const cssProcessor = postcss([noop()]);

	/* eslint-disable no-undefined */
	let response = await cssProcessor.process(inputCssString, {
		syntax: postcssScss,
		from: undefined
	});
	let root = response.root;

	const node = postcss.rule({
		selector: '.__sassVars__'
	});

	root.walkDecls(/^\$/, (decl) => {
		if (decl.parent === root) {
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
	root.append(node);

	const { functions, ...otherSassOptions } = sassOptions;

	response = await promisify(sass.render)({
		data: root.toString(),
		functions: { ...jsonFns, ...functions },
		...otherSassOptions
	});

	response = await cssProcessor.process(response.css.toString(), {
		from: undefined
	});
	root = response.root;

	const data = {};

	root.walkRules('.__sassVars__', (rule) => {
		rule.walkDecls('content', (decl) => {
			const [property, value] = decl.value.split(' ":" ');
			data[stripOuter(property, '"')] = JSON.parse(
				stripOuter(value, "'")
			);
		});
	});

	if (camelize) {
		return camelcaseKeys(
			fromEntries(
				Object.entries(data).map(([key, value]) => [
					stripOuter(key, '$'),
					value
				])
			)
		);
	}
	return data;
};
