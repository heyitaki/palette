import { LinkSelection, NodeSelection } from '../types';
import Node from './components/nodes/Node';
import Graph from './Graph';

export function getAllNodes(graph: Graph): NodeSelection {
  return graph.nodeContainer.selectAll('.node');
}

export function getSelectedNodes(graph: Graph): NodeSelection {
  return graph.nodeContainer.selectAll('.node.selected');
}

export function getAllLinks(graph: Graph): LinkSelection {
  return graph.linkContainer.selectAll('.link-body');
}

export function getAllLinkText(graph: Graph) {
  return graph.linkContainer.selectAll('.link').selectAll('.link-title');
}

/**
 * Get list of data bound to a given selection of nodes
 * @param selection d3 selection of DOM elements
 */
export function getDataFromSelection(selection: NodeSelection): Node[] {
  if (!selection || selection.empty()) return;
  return selection.nodes().map((x: any) => x.__data__);
}
