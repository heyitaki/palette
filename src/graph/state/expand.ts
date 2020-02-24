import { BaseType, Selection } from "d3-selection";
import Graph from "../../Graph";
import { loadGraphData, toArray } from "../../utils";
import Node from '../components/nodes/Node';
import { getDataFromSelection } from "../selection";

/**
 * Add all first degree neighbors of nodes corresponding to given ids. If a node is not
 * expandable, ignore it.
 */
export function expandNodesByData(graph: Graph, nodesToExpand: Node | Node[]): number {
  // If dataList is an object, wrap it with a list
  if (nodesToExpand === null) return;
  nodesToExpand = toArray(nodesToExpand);

  // Do nothing if we are given nodes that are not expandable
  nodesToExpand = nodesToExpand.filter((n: Node) => isExpandable(n));
  if (nodesToExpand.length === 0) return;

  // Freeze root nodes and expand
  const idList: string[] = nodesToExpand.map((n: Node) => n.id);
  loadGraphData(graph, graph.server.getNeighbors(idList));
  return idList.length;
}

/**
 * Add all first degree neighbors of given nodes to graph. If a node is not 
 * expandable, ignore it.
 */
export function expandNodes(graph: Graph, 
    nodes: Selection<BaseType, unknown, SVGGElement, unknown>): number {
  if (nodes === null || nodes.empty()) return;
  const dataList: Node[] = getDataFromSelection(nodes);
  return expandNodesByData(graph, dataList);
}

/**
 * Determine whether or not node associated with given data is expandable. Excludes some neighbors
 * based on certain node types.
 */
export function isExpandable(n: Node): boolean {
  if (!n.totalLinks || !n.weight) return false;
  return n.totalLinks > n.weight;
}

/**
 * Compute number of first degree neighbors of node associated with given data that are not 
 * yet displayed. Neighbors with certain link types are excluded. This is used to populate 
 * node glyphs.
 */
export function getNumLinksToExpand(n: Node): number {
  if (!isExpandable(n)) return 0;
  return Math.max(n.totalLinks - n.weight, 0);
}
