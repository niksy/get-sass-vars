declare module 'strip-outer' {
	function stripOuter(string: string, substring: string): string;
	export = stripOuter;
}

declare module '@ungap/from-entries' {
	function fromEntries(array: unknown[]): object;
	export = fromEntries;
}
