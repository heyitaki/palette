import Graph from "../../Graph";
import Link from "../components/links/Link";
import Node from "../components/nodes/Node";

/**
* Add given nodes to adjacency map.
* @param nodes Single node or list of one or more nodes to be added.
* @param map Adjacency map of nodes and links in graph.
* @param update Whether or not to update graph after adding links. Suppress 
* updates of back-to-back state changes so that we can re-render just once at
* the end.
*/
export function addNodes(graph: Graph, nodes: Node | Node[], update=true) {
  graph.adjacencyMap.addNodes(nodes);
  if (update) graph.updateGraph();
}

/**
* Add given links to adjacency map.
* @param links Single link or list of one or more links to be added.
* @param map Adjacency map of nodes and links in graph.
* @param update Whether or not to update graph after adding links. Suppress 
* updates of back-to-back state changes so that we can re-render just once at
* the end.
*/
export function addLinks(graph: Graph, links: Link | Link[], update=true) {
  graph.adjacencyMap.addLinks(links);
  if (update) graph.updateGraph();
}
