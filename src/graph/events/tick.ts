import { LinkSelection, LinkTransition, NodeSelection, NodeTransition } from '../../types';
import Link from '../components/links/Link';
import Graph from '../Graph';
import { getDistance } from '../utils';

/**
 * Calculate new positions of all graph items.
 * @param graph
 */
export function tick(graph: Graph): void {
  setNodePositions(graph.nodes);
  setLinkPositions(graph.links);
}

/**
 * Translate nodes from where they are currently displayed to their new
 * calculated positions.
 * @param nodes - Object containing list of nodes to translate.
 */
export function setNodePositions(nodes: NodeSelection | NodeTransition) {
  nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

/**
 * Update links based on source and target node positions. Draw link from node
 * edges as opposed to centers.
 * @param links - Object containing list of links to update.
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
 * Update position and angle of link texts. Ensure that link text background
 * stays centered on link text. Hide link texts that are too short for the link.
 */
export function setLinkTextPositions() {
  // this.linkContainer.selectAll('.link-text')
  //         .attr('transform', aesthetics.rotateLinkText)
  //     .select('textPath')
  //         .each(aesthetics.hideLongLinkText);
  // this.link.attr('stroke-dasharray', aesthetics.createLinkTextBackground);
}
