import { getDataFromSelection } from "../selection";

/**
* Remove nodes corresponding to given data and reset highlighting.
* @param nodeData Data of nodes to be removed.
*/
export function removeNodesByData(nodeData, update=true) {
  this.adjacencyStructure.removeNodes(nodeData);
  // aesthetics.resetObjectHighlighting.bind(this)();
  if (update) this.update();
}

/**
* Remove given nodes and reset highlighting.
* @param nodes Nodes to be removed.
*/
export function removeNodes(nodes, update=true) {
  const nodeData = getDataFromSelection(nodes);
  removeNodesByData.bind(this)(nodeData, update);
}

/**
* Remove node associated with given data as well as all neighboring nodes that would become
* free radicals (nodes with no links) if given node were to be removed. However, we do not
* remove nodes that are currently free radicals.
* @param d Datum of node to be removed.
*/
export function removeNodeAndSinglyConnectedNeighbors(d) {
  // Mark all current free radicals
  this.node
    .filter((o) => { return o.weight === 0; })
    .each((o) => { o.saveRadical = true; });

  // Remove all neighbors of nodes which don't have other connections
  removeNodes.bind(this)(this.node.filter((o) => { 
    return this.adjacencyStructure.areNeighbors(d.id, o.id) 
      && (o.weight <= 1); 
  }), false);

  // Remove any newly created free radicals
  removeNodes.bind(this)(this.node.filter((o) => { 
    return (o.weight === 0) 
      && !o.saveRadical
      && o.id != d.id; 
  }), false);

  // Reset marked free radicals
  this.node
    .filter((o) => { return o.weight === 0; })
    .each((o) => { o.saveRadical = false; });

  // Finally, remove the given node
  removeNodesByData.bind(this)(d);
}
