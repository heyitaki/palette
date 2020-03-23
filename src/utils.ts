import Graph from "./Graph";
import Link from "./graph/components/links/Link";
import Card from "./graph/components/nodes/Card";
import Circle from "./graph/components/nodes/Circle";
import Node from "./graph/components/nodes/Node";
import ThinCard from "./graph/components/nodes/ThinCard";
import { NODE_THIN_CARD_HEIGHT } from "./graph/constants/graph";
import GraphData from "./server/GraphData";
import LinkData from "./server/LinkData";
import NodeData from "./server/NodeData";

type FixedOutputTypeFn<O> = (...args: any[]) => O;

/**
 * Wrap input in array if it isn't already an array.
 * @param input 
 */
export function toArray<T>(input: T | T[]): T[] {
  if (input == null) return []; // Catch undefined and null values
	return (input instanceof Array) ? input : [input];
}

export function exists(input) {
	return !(!input && input != 0);
}

/**
 * Wrap input in function if it isn't already a function.
 * @param input Output or function that returns an output of the same type.
 */
export function toFunction<O>(input: O | FixedOutputTypeFn<O>): 
    FixedOutputTypeFn<O> {
  if (typeof input === 'function') return input as FixedOutputTypeFn<O>;
  else return () => input;
}

/**
 * Get value from map, set and return default value if key doesn't exist.
 * @param map Map to get value from
 * @param key Key associated to value
 * @param defaultVal Set and return value if key does not already exist in map
 */
export function getMapVal<K, V>(map: Map<K, V>, key: K, defaultVal: V=null) {
  if (!map.has(key)) map.set(key, defaultVal);
  return map.get(key);
}

export function loadGraphData(graph: Graph, graphData: GraphData) {
  graph.adjacencyMap.addNodes(graphData.nodes);
  graph.adjacencyMap.addLinks(graphData.links, true);
}

export function nodeDataToNodeObj(graph: Graph, data: NodeData | NodeData[]): Node[] {
  let nodes: Node[] = [], node;
  data = toArray(data);
  for (let i = 0; i < data.length; i++) {
    if (!data[i].type) continue;

    // TODO: Should type -> obj conversion happen with switch or a dict in
    // constants file?
    switch (data[i].type.toLowerCase()) {
      case "intro":
        node = new Card(graph, data[i]);
        break;
      case "topic":
      case "subject":
        node = new ThinCard(graph, data[i], NODE_THIN_CARD_HEIGHT);
        break;
      default:
        node = new Circle(graph, data[i]);
    }

    nodes.push(node);
  }

  return nodes;
}

export function linkDataToLinkObj(graph: Graph, data: LinkData | LinkData[]): Link[] {
  data = toArray(data);
  const links: Link[] = [];
  for (let i = 0; i < data.length; i++) {
    links.push(new Link(data[i], graph.adjacencyMap));
  }

  return links;
}
