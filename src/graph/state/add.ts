import { updateGraph } from "../events/update";

/**
* Add nodes corresponding to given data.
* @param nodeData Data of nodes to be added.
*/
export function addNodesByData(nodeData, update=true) {
  this.adjacencyMap.addNodes(nodeData);
  if (update) updateGraph.bind(this)();
}

/**
* Add links corresponding to given data.
* @param linkData Data of links to be added.
*/
export function addLinksByData(linkData, update=true) {
  this.adjacencyMap.addLinks(linkData);
  if (update) updateGraph.bind(this)();
}
