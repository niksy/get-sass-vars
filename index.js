'use strict';

const _ = require('lodash');
const pify = require('pify');
const stripOuter = require('strip-outer');
const camelcaseKeys = require('camelcase-keys');
const postcss = require('postcss');
const sass = require('node-sass');
const jsonFns = require('node-sass-json-functions');

/**
 * @param  {String} inputCssStr
 * @param  {Object} opts
 *
 * @return {Promise}
 */
module.exports = ( inputCssStr, opts ) => {

	opts = opts || {};

	return postcss().process(inputCssStr)
		.then(( res ) => {

			const root = res.root;
			const node = postcss.rule({
				selector: '.__sassVars__'
			});

			root.walkDecls(/^\$/, ( decl ) => {
				if ( decl.parent === root ) {
					node.append({
						prop: 'content',

						// decl.prop as property is wrapped inside quotes so it doesn’t get transformed with Sass
						// decl.prop as value will be transformed with Sass
						value: `"${decl.prop}" ":" json-encode(${decl.prop})`
					});
				}
			});
			root.append(node);

			return root.toString();

		})
		.then(( cssStr ) => {

			return pify(sass.render)(_.extend({
				data: cssStr,
				functions: Object.assign({}, jsonFns)
			}, opts.sassOptions))
				.then(( res ) => {
					return res.css.toString();
				});

		})
		.then(( cssStr ) => {

			return postcss().process(cssStr)
				.then(( res ) => {

					const root = res.root;
					const data = {};

					root.walkRules('.__sassVars__', ( rule ) => {
						rule.walkDecls('content', ( decl ) => {
							const val = decl.value.split(' ":" ');
							data[stripOuter(val[0], '"')] = JSON.parse(stripOuter(val[1], '\''));
						});
					});

					return data;

				});

		})
		.then(( data ) => {

			if ( opts.camelize ) {
				return camelcaseKeys(_.mapKeys(data, ( val, key ) => {
					return stripOuter(key, '$');
				}));
			}
			return data;

		});


};
