export function toArray<T>(input: T | T[]): T[] {
	return (input instanceof Array) ? input : [input];
}
