import { select } from 'd3-selection';
import { LinkSelection, LinkTransition, NodeSelection, NodeTransition } from '../../types';
import Link from '../components/links/Link';
import { createLinkTitleBackground, rotateLinkTitle } from '../components/links/utils';
import Graph from '../Graph';
import { getLinkTitles } from '../selection';
import { getDistance } from '../utils';

/**
 * Calculate new positions of all graph items.
 * @param graph Graph to update
 */
export function tick(graph: Graph): void {
  setNodePositions(graph.nodes);
  setLinkPositions(graph.links);
  setLinkTextPositions(graph);
}

/**
 * Translate nodes from where they are currently displayed to their new
 * calculated positions.
 * @param nodes Object containing list of nodes to translate
 */
export function setNodePositions(nodes: NodeSelection | NodeTransition): void {
  nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

/**
 * Update links based on source and target node positions. Draw link from node
 * edges as opposed to centers.
 * @param links Object containing list of links to update
 */
export function setLinkPositions(links: LinkSelection | LinkTransition): void {
  links.attr('d', (l: Link): string => {
    const sourcePos = l.source.getLinkPosition(l);
    const targetPos = l.target.getLinkPosition(l);
    l.length = getDistance(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y);
    return 'M' + sourcePos.x + ',' + sourcePos.y + 'L' + targetPos.x + ',' + targetPos.y;
  });
}

/**
 * Update position and angle of link texts while ensuring that link text background
 * stays centered on link text. Hide link texts that are too short for the link.
 * @param graph Graph containing links to update
 * @param links Specific links to update
 */
export function setLinkTextPositions(graph: Graph, links?: LinkSelection): void {
  getLinkTitles(graph, links).attr('transform', rotateLinkTitle);
  (links || graph.links).attr('stroke-dasharray', (l: Link) => createLinkTitleBackground(graph, l));
}
