import NodeTransformer from '../../transformers/NodeTransformer';
import { NodeSelection } from '../../types';
import { loadGraphData } from '../../utils';
import Node from '../components/nodes/Node';
import Graph from '../Graph';

/**
 * Add all first degree neighbors of given nodes to graph. If a node is not
 * expandable, ignore it.
 */
export function expandNodes(graph: Graph, nodes: NodeSelection): Promise<void> {
  if (!nodes || nodes.empty()) return;

  // Get ids of nodes to expand, return if there are no nodes to expand
  const expandedNodes: Node[] = [];
  nodes.each((n: Node) => {
    if (isExpandable(n)) expandedNodes.push(n);
  });
  if (expandedNodes.length === 0) return;

  // Add all neighboring nodes and links of expanded nodes to graph
  const newData = graph.server.getNeighbors(expandedNodes.map((n) => n.id));
  loadGraphData(graph, newData);

  // Center graph on node(s) that were expanded
  graph.zoom.scaleGraphAroundNodes(
    expandedNodes,
    NodeTransformer.nodeDataToNodeObj(newData.nodes, graph),
  );
}

/**
 * Determine whether or not node is expandable.
 */
export function isExpandable(n: Node): boolean {
  return n.totalLinks > n.weight;
}

/**
 * Compute number of first degree neighbors of given node. Used to populate
 * node glyphs.
 */
export function getNumLinksToExpand(n: Node): number {
  return Math.max(n.totalLinks - n.weight, 0);
}
