import Graph from "../../Graph";
import { NodeSelection } from "../../types";
import { loadGraphData } from "../../utils";
import Node from '../components/nodes/Node';

/**
 * Add all first degree neighbors of given nodes to graph. If a node is not 
 * expandable, ignore it.
 */
export function expandNodes(graph: Graph, nodes: NodeSelection): number {
  if (nodes === null || nodes.empty()) return;
  const idList: string[] = [];
  nodes.each((n: Node) => { if (isExpandable(n)) idList.push(n.id); });
  loadGraphData(graph, graph.server.getNeighbors(idList));
  return idList.length;
}

/**
 * Determine whether or not node is expandable. 
 */
export function isExpandable(n: Node): boolean {
  return n.totalLinks > n.weight;
}

/**
 * Compute number of first degree neighbors of given node. Used to populate 
 * node glyphs.
 */
export function getNumLinksToExpand(n: Node): number {
  return Math.max(n.totalLinks - n.weight, 0);
}
