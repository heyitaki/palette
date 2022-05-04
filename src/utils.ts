import { event } from 'd3-selection';
import Graph from './graph/Graph';
import GraphData from './server/GraphData';

type FixedOutputTypeFn<O> = (...args: any[]) => O;

/**
 * Wrap input in array if it isn't already an array.
 * @param input
 */
export function toArray<T>(input: T | T[]): T[] {
  if (input == null) return []; // Catch undefined and null values
  return input instanceof Array ? input : [input];
}

/**
 * Wrap input in function if it isn't already a function.
 * @param input Output or function that returns an output of the same type.
 */
export function toFunction<O>(input: O | FixedOutputTypeFn<O>): FixedOutputTypeFn<O> {
  if (typeof input === 'function') return input as FixedOutputTypeFn<O>;
  else return () => input;
}

/**
 * Get value from map, set and return default value if key doesn't exist.
 * @param map Map to get value from
 * @param key Key associated to value
 * @param defaultVal Set and return value if key does not already exist in map
 */
export function getMapVal<K, V>(map: Map<K, V>, key: K, defaultVal: V = null) {
  if (!map.has(key)) map.set(key, defaultVal);
  return map.get(key);
}

/**
 * Shorthand to stop event propagation.
 */
export function stopPropagation() {
  event.stopPropagation();
}

/**
 * Load node and link data from server into the given graph.
 * @param graph Graph to load data into
 * @param graphData Data of nodes and links to add to the graph
 * @returns A promise that resolves when the data is loaded and the graph has cooled
 */
export function loadGraphData(graph: Graph, graphData: GraphData): Promise<void> {
  graph.adjacencyMap.addNodes(graphData.nodes);
  return graph.adjacencyMap.addLinks(graphData.links, true);
}
