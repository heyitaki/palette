import Graph from '../Graph';
import { LinkSelection, NodeSelection } from '../types';
import Node from './components/nodes/Node';

export function getSelectedNodes(graph: Graph): NodeSelection {
  return graph.nodeContainer.selectAll('.node.selected');
}

export function getAllNodes(graph: Graph): NodeSelection {
  return graph.nodeContainer.selectAll('.node');
}

export function getAllLinks(graph: Graph): LinkSelection {
  return graph.linkContainer.selectAll('.link');
}

/**
 * Get list of data bound to a given selection of nodes
 * @param selection d3 selection of DOM elements
 */
export function getDataFromSelection(selection: NodeSelection): Node[] {
  if (!selection || selection.empty()) return;
  return selection.nodes().map((x: any) => x.__data__);
}
