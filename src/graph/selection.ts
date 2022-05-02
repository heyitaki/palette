import {
  GroupSelection,
  LinkBodySelection,
  LinkSelection,
  LinkTitleSelection,
  NodeSelection,
} from '../types';
import Node from './components/nodes/Node';
import Graph from './Graph';
import { Selection } from 'd3-selection';

export class GraphSelections {
  canvasContainer: GroupSelection;
  defs: Selection<SVGDefsElement, any, HTMLElement, any>;
  graphContainer: GroupSelection;
  linkBodies: LinkBodySelection;
  linkContainer: GroupSelection;
  nodeContainer: GroupSelection;
  nodes: NodeSelection;
}

/**
 *
 * @param graph
 * @returns
 */
export function getAllNodes(graph: Graph): NodeSelection {
  return graph.refs.nodeContainer.selectAll('.node');
}

/**
 *
 * @param graph
 * @returns
 */
export function getSelectedNodes(graph: Graph): NodeSelection {
  return graph.refs.nodeContainer.selectAll('.node.selected');
}

/**
 *
 * @param graph
 * @returns
 */
export function getAllLinkBodies(graph: Graph): LinkBodySelection {
  return graph.refs.linkContainer.selectAll('.link-body');
}

/**
 * Get link title elements that are associated with the links in the given selection. If no
 * selection is specified, all link title elements are returned.
 * @param graph Graph to select link title elements from
 * @param links Optional parameter to specify which links to get titles of
 * @returns A D3 selection of the specified link title elements.
 */
export function getLinkTitles(graph: Graph, links?: LinkSelection): LinkTitleSelection {
  return (links || graph.refs.linkContainer.selectAll('.link')).selectAll('.link-title');
}

/**
 * Get list of data bound to a given selection of nodes.
 * @param selection d3 selection of DOM elements
 */
export function getDataFromSelection(selection: NodeSelection): Node[] {
  if (!selection || selection.empty()) return [];
  return selection.nodes().map((x: any) => x.__data__);
}
