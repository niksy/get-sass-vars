# get-sass-vars

[![Build Status][ci-img]][ci]

Get Sass variables as JSON object.

## Install

```sh
npm install get-sass-vars --save
```

## Usage

```js
var fs = require('fs');
var sassVars = require('get-sass-vars');

sassVars(fs.readFileSync('./index.scss', 'utf-8'))
	.then(function ( json ) {
		console.log(json);
		/* {
			"$foo": "16px",
			"$bar": "17.6px",
			"$baz": 42,
			"$foo-bar": "#666",
			"$foo-bar-baz": "#262626",
			"$foo-bar-baz-bad": "#123",
			"$grault": [1, 2, "3", "4px", "42%", "1.23457px", [4, 5, 6], {"foo": "bar baz"}],
			"$garply": {"foo": 1, "bar": [2, 3], "baz": "3 3 3"},
			"$qux": false,
			"$fred": true,
			"$corgle": null
		} */
	});
```

### `index.scss`

```scss
$foo: 16px;
$bar: $foo * 1.1;
$baz: 42;
$foo-bar: #666;
$foo-bar-baz: darken($foo-bar, 25%);
$foo-bar-baz-bad: #123 !default;
$grault: 1, 2, "3", 4px, 42%, 1.23456789px, (4,5,6), (foo: "bar baz");
$garply: (
	foo: 1,
	bar: (2, 3),
	baz: "3 3 3"
);
$qux: false;
$fred: true;
$corgle: null;
```

## API

### sassVars(str, [opts])

Returns: `Promise`

Gets Sass variables from Sass string.

#### str

Type: `String`  
**Required**

Sass input string.

#### opts

Type: `Object`

##### camelize

Type: `Boolean`  
Default: `false`

Camelize first-level JSON object keys and strip inital `$` (e.g. `$foo-bar` will become `fooBar`).

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/get-sass-vars
[ci-img]: https://img.shields.io/travis/niksy/get-sass-vars.svg
