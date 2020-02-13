import Graph from "./Graph";
import AdjacencyMap from "./graph/AdjacencyMap";
import Link from "./graph/components/links/Link";
import Card from "./graph/components/nodes/Card";
import Circle from "./graph/components/nodes/Circle";
import Node from "./graph/components/nodes/Node";
import ThinCard from "./graph/components/nodes/ThinCard";
import { NODE_THIN_CARD_HEIGHT } from "./graph/constants/graph";
import LinkData from "./server/LinkData";
import NodeData from "./server/NodeData";

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

export function linkDataToLinkObj(data: LinkData | LinkData[], map: AdjacencyMap): Link[] {
  data = toArray(data);
  const links: Link[] = [];
  for (let i = 0; i < data.length; i++) {
    links.push(new Link(data[i], map));
  }

  return links;
}
