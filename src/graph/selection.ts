import { LinkSelection, LinkTitleSelection, NodeSelection } from '../types';
import Link from './components/links/Link';
import Node from './components/nodes/Node';
import Graph from './Graph';

/**
 *
 * @param graph
 * @returns
 */
export function getAllNodes(graph: Graph): NodeSelection {
  return graph.nodeContainer.selectAll('.node');
}

/**
 *
 * @param graph
 * @returns
 */
export function getSelectedNodes(graph: Graph): NodeSelection {
  return graph.nodeContainer.selectAll('.node.selected');
}

/**
 *
 * @param graph
 * @returns
 */
export function getAllLinks(graph: Graph): LinkSelection {
  return graph.linkContainer.selectAll('.link-body');
}

/**
 * Get link title elements that are associated with the links in the given selection. If no
 * selection is specified, all link title elements are returned.
 * @param graph Graph to select link title elements from
 * @param links Optional parameter to specify which links to get titles of
 * @returns A D3 selection of the specified link title elements.
 */
export function getLinkTitles(graph: Graph, links?: LinkSelection): LinkTitleSelection {
  return (links || graph.linkContainer.selectAll('.link')).selectAll('.link-title');
}

/**
 * Get list of data bound to a given selection of nodes.
 * @param selection d3 selection of DOM elements
 */
export function getDataFromSelection(selection: NodeSelection): Node[] {
  if (!selection || selection.empty()) return [];
  return selection.nodes().map((x: any) => x.__data__);
}
