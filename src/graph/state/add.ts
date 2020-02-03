import AdjacencyMap from "../AdjacencyMap";
import Link from "../components/links/Link";
import Node from "../components/nodes/Node";
import { updateGraph } from "../events/update";

/**
* Add given nodes to adjacency map.
* @param nodes Single node or list of one or more nodes to be added.
* @param map Adjacency map of nodes and links in graph.
* @param update Whether or not to update graph after adding links. Suppress 
* updates of back-to-back state changes so that we can re-render just once at
* the end.
*/
export function addNodes(nodes: Node | Node[], map: AdjacencyMap, update=true) {
  map.addNodes(nodes);
  if (update) updateGraph.bind(this)();
}

/**
* Add given links to adjacency map.
* @param links Single link or list of one or more links to be added.
* @param map Adjacency map of nodes and links in graph.
* @param update Whether or not to update graph after adding links. Suppress 
* updates of back-to-back state changes so that we can re-render just once at
* the end.
*/
export function addLinks(links: Link | Link[], map: AdjacencyMap, update=true) {
  map.addLinks(links);
  if (update) updateGraph.bind(this)();
}
