import { getDataFromSelection } from "../selection";

/**
* Add nodes corresponding to given data.
* @param nodeData Data of nodes to be added.
*/
export function addNodesByData(nodeData, update=true) {
  this.adjacencyMap.addNodes(nodeData);
  if (update) this.update();
}

/**
* Add given nodes to graph.
* @param nodes Nodes to be added.
*/
export function addNodes(nodes, update=true) {
  const nodeData = getDataFromSelection(nodes);
  addNodesByData.bind(this)(nodeData, update);
}
