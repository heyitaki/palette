import { BaseType, Selection } from "d3-selection";
import Graph from "../../Graph";
import Node from "../components/nodes/Node";
import { getDataFromSelection } from "../selection";

/**
* Remove nodes corresponding to given data and reset highlighting.
* @param nodeData Data of nodes to be removed.
*/
export function removeNodesByData(graph: Graph, nodes: Node | Node[], update=true) {
  graph.adjacencyMap.deleteNodes(nodes);
  // aesthetics.resetObjectHighlighting.bind(this)();
  if (update) graph.updateGraph();
}

/**
* Remove given nodes and reset highlighting.
*/
export function removeNodes(graph: Graph, 
    nodes: Selection<BaseType, unknown, SVGGElement, unknown>, 
    update=true): void {
  const nodeData: Node[] = getDataFromSelection(nodes);
  removeNodesByData.bind(this)(graph, nodeData, update);
}

/**
* Remove node associated with given data as well as all neighboring nodes that would become
* free radicals (nodes with no links) if given node were to be removed. However, we do not
* remove nodes that are currently free radicals.
*/
export function removeNodeAndSinglyConnectedNeighbors(graph: Graph, nodeToRemove: Node): void {
  // Mark all current free radicals
  graph.node
    .filter((n: Node) => { return n.weight === 0; })
    .each((n: Node) => { n.saveRadical = true; });

  // Remove all neighbors of nodes which don't have other connections
  removeNodes(graph, graph.node.filter((n: Node) => { 
    return graph.adjacencyMap.areNeighbors(nodeToRemove.id, n.id) 
      && (n.weight <= 1); 
  }), false);

  // Remove any newly created free radicals
  removeNodes(graph, graph.node.filter((n: Node) => { 
    return (n.weight === 0) 
      && !n.saveRadical
      && n.id != nodeToRemove.id; 
  }), false);

  // Reset marked free radicals
  graph.node
    .filter((n: Node) => { return n.weight === 0; })
    .each((n: Node) => { n.saveRadical = false; });

  // Finally, remove the given node
  removeNodesByData(graph, nodeToRemove);
}
