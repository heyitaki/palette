import Graph from "../../Graph";
import { toArray } from "../../utils";
import Node from '../components/nodes/Node';

/**
 * Add all first degree neighbors of nodes corresponding to given ids. If a node is not
 * expandable, ignore it.
 */
export function expandNodesByData(graph: Graph, nodes: Node | Node[]): number {
  // If dataList is an object, wrap it with a list
  if (nodes === null) return;
  nodes = toArray(nodes);

  // Do nothing if we are given nothing
  nodes = nodes.filter((n: Node) => isExpandable(n));
  if (nodes.length === 0) return;

  // Freeze root nodes and expand
  const idList: string[] = nodes.map((n: Node) => n.id);
  graph.server.getNeighbors(idList);
  //this.expandNodesFromData(idList);
  return idList.length;
}

/**
* Add all first degree neighbors of given nodes to graph. If a node is not expandable, ignore it.
* @return {number} Returns number of nodes that were expanded.
*/
export function expandNodes(nodes) {
  if (nodes === null || nodes.length === 0) return;
  const dataList = nodes.nodes().map(x => x.__data__);
  return expandNodesByData.bind(this)(dataList);
}

/**
* Determine whether or not node associated with given data is expandable. Excludes some neighbors
* based on certain node types.
* @param {Object} d Datum associated with node to check.
* @return {boolean} Returns if node can be expanded or not.
*/
export function isExpandable(d) {
  if (!d.totalLinks || !d.weight) return false;
  return d.totalLinks > d.weight;
}

/**
* Compute number of first degree neighbors of node associated with given data that are not 
* yet displayed. Neighbors with certain link types are excluded. This is used to populate 
* node glyphs.
* @param  {Object} d Datum associated with node to check.
* @return {number} Returns the number of neighbors that are not yet displayed on the graph.
*/
export function getNumLinksToExpand(d) {
  if (!isExpandable(d)) return 0;
  return Math.max(d.totalLinks - d.weight, 0);
}
