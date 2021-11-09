declare module 'strip-outer' {
	function stripOuter(string: string, substring: string): string;
	export = stripOuter;
}

declare module 'node-sass-json-functions' {
	function sassFunction(): void;
	const functions: {
		'json-encode': typeof sassFunction,
		'json-decode': typeof sassFunction,
	};
	export = functions;
}

declare module '@ungap/from-entries' {
	function fromEntries(array: unknown[]): object;
	export = fromEntries;
}
