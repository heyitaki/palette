import { getSelectedNodes } from "../selection";

/**
 * Add all first degree neighbors of nodes corresponding to given ids. If a node is not
 * expandable, ignore it.
 * @param  {Object || Object[]} dataList List of data of nodes to be expanded. Single values
 * can be passed in as an Object instead of as a list.
 * @return {number} Returns the number of nodes expanded.
 */
export function expandNodesByData(dataList) {
  // If dataList is an object, wrap it with a list
  if (dataList === null) return;
  if (!Array.isArray(dataList)) dataList = [dataList];

  // Do nothing if we are given nothing
  dataList = dataList.filter((d) => { return isExpandable(d); });
  if (dataList.length === 0) return;

  // Freeze root nodes and expand
  // for (let i = 0; i < dataList.length; i++) actions.freezeNodeByData(dataList[i], true);
  const idList = dataList.map(d => d.id);
  this.expandNodesFromData(idList);
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
