export function toArray(input) {
	return (input instanceof Array) ? input : [input];
}

export function exists(input) {
	return !(!input && input != 0);
}
