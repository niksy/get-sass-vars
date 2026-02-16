/** @type {import('prettier').Config} */
export default {
	printWidth: 100,
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	quoteProps: 'preserve',
	jsxSingleQuote: true,
	trailingComma: 'none',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	requirePragma: false,
	insertPragma: false,
	proseWrap: 'always',
	htmlWhitespaceSensitivity: 'css',
	vueIndentScriptAndStyle: false,
	endOfLine: 'lf',
	embeddedLanguageFormatting: 'auto',
	singleAttributePerLine: false,
	objectWrap: 'preserve',
	overrides: [
		{
			files: ['package.json', '*.yml'],
			options: {
				useTabs: false,
				tabWidth: 2
			}
		}
	]
};
