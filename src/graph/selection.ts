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

/**
 * Defines the different DOM selections important to a graph.
 */
export class GraphSelections {
  /**
   * This is a reference to the `svg` or `canvas` element within which the entire graph exists.
   */
  canvasContainer: GroupSelection;

  /**
   * This is a reference to a `defs` element, which contains link marker definitions.
   */
  defs: Selection<SVGDefsElement, any, HTMLElement, any>;

  /**
   * A reference to the top-level container within `canvasContainer` within which all graph
   * elements exist (i.e. nodes, links, grid).
   */
  graphContainer: GroupSelection;

  /**
   * A selection of all link body elements, which are SVG paths, in `linkContainer`.
   */
  linkBodies: LinkBodySelection;

  /**
   * A reference to the container that holds all links in this graph.
   */
  linkContainer: GroupSelection;

  links: LinkSelection;

  /**
   * A reference to the container that holds all nodes in this graph.
   */
  nodeContainer: GroupSelection;

  /**
   * A selection of all node `g` elements in the graph, each of which contains a node body, glyph,
   * and node title.
   */
  nodes: NodeSelection;
}

/**
 * Get all nodes from given graph.
 * @param graph Graph to get nodes from
 * @returns A D3 selection of all nodes in given graph
 */
export function getAllNodes(graph: Graph): NodeSelection {
  return graph.refs.nodeContainer.selectAll('.node');
}

/**
 * Get all selected nodes from given graph.
 * @param graph Graph to get selected nodes from
 * @returns A D3 selection of selected nodes
 */
export function getSelectedNodes(graph: Graph): NodeSelection {
  return graph.refs.nodeContainer.selectAll('.node.selected');
}

/**
 * Get all links from given graph.
 * @param graph Graph to select links from
 * @returns A D3 selection of all links
 */
export function getAllLinks(graph: Graph): LinkSelection {
  return graph.refs.linkContainer.selectAll('.link');
}

/**
 * Get all path elements that contain the link bodies in the given graph.
 * @param graph Graph to select link bodies from
 * @returns A D3 selection of link bodies
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
 * @param selection A D3 selection of DOM elements
 * @returns List of data bound to the given selection
 */
export function getDataFromSelection(selection: NodeSelection): Node[] {
  if (!selection || selection.empty()) return [];
  return selection.nodes().map((x: any) => x.__data__);
}
