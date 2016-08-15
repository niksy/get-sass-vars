var _ = require('lodash');
var pify = require('pify');
var stripOuter = require('strip-outer');
var camelcaseKeys = require('camelcase-keys');
var postcss = require('postcss');
var sass = require('node-sass');
var jsonFns = require('node-sass-json-functions');

module.exports = function ( inputCssStr, opts ) {

	opts = opts || {};

	return postcss().process(inputCssStr)
		.then(function ( res ) {

			var root = res.root;
			var node = postcss.rule({
				selector: '.__sassVars__'
			});

			root.walkDecls(/^\$/, function ( rule ) {
				node.append({
					prop: 'content',

					// rule.prop as property is wrapped inside quotes so it doesn’t get transformed with Sass
					// rule.prop as value will be transformed with Sass
					value: `"${rule.prop}" ":" json-encode(${rule.prop})`
				});
			});
			root.append(node);

			return root.toString();

		})
		.then(function ( cssStr ) {

			return pify(sass.render)(_.extend({
				data: cssStr,
				functions: Object.assign({}, jsonFns)
			}, opts.sassOptions))
				.then(function ( res ) {
					return res.css.toString();
				});

		})
		.then(function ( cssStr ) {

			return postcss().process(cssStr)
				.then(function ( res ) {

					var root = res.root;
					var data = {};

					root.walkRules('.__sassVars__', function ( rule ) {
						rule.walkDecls('content', function ( decl ) {
							var val = decl.value.split(' ":" ');
							data[stripOuter(val[0], '"')] = JSON.parse(stripOuter(val[1], '\''));
						});
					});

					return data;

				});

		})
		.then(function ( data ) {

			if ( opts.camelize ) {
				return camelcaseKeys(_.mapKeys(data, function ( val, key ) {
					return stripOuter(key, '$');
				}));
			}
			return data;

		});


};
