import { forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import * as constants from './constants/graph'
import * as zoom from './events/zoom';

export function initForce() {
  this.force = forceSimulation()
    .force('link', forceLink().distance(250).strength(1).iterations(6))
    .force('charge', forceManyBody().strength(-15000).distanceMax(10000).theta(0.75))
    .force('y', forceY().strength(0.2))
    .force('x', forceX().strength(0.2))
    .velocityDecay(constants.VELOCITY_DECAY)
    .stop();
}

/**
 * Check if graph has cooled and is in a stable state.
 * @return {Boolean} Returns whether or not graph has cooled.
 */
export function isGraphCooled() {
  return this.force.alpha() < this.force.alphaMin();
}

/**
* Speeds up graph cooling. Calculate final stable positions of each node and then
* transition them from their current positions, so that we don't have to render
* every frame.
*/
export function fastForceConvergence() {
  const nodeTransitionMs = 500,
        linkTransitionMs = 75;

  // Necessary to not trigger rendering in ticked
  this.fastConvergence = true;

  // Loop force.tick until graph is cooled
  this.force.alpha(1).stop(); 
  while (!isGraphCooled.bind(this)()) this.force.tick();

  // Unfreeze root nodes and let graph cool again
  // if (this.rootNodeIds && this.rootNodeIds.length > 0) {
  //     this.node.each((d) => { actions.freezeNodeByData(d, false); });
  //     this.force.alpha(1);
  //     while (!isGraphCooled.bind(this)()) this.force.tick();
  // }

  // Fade links out so we don't have to deal with/render them during the transition
  // aesthetics.removeLinkText.bind(this)();
  this.link.transition('link-opacity').duration(0).style('opacity', 0).remove();

  // Translate nodes over half a second
  const nodeInput = this.node
    .transition('node-opacity').duration(nodeTransitionMs)
    .style('opacity', 1);

  // Wait for nodes to translate, then add links back
  const linkInput = this.link
    .transition('link-opacity').delay(nodeTransitionMs).duration(linkTransitionMs)
    .style('opacity', 1)
    .on('end', () => { this.fastConvergence = false; });

  setNodePositions.bind(this)(nodeInput);
  setLinkPositions.bind(this)(linkInput);

  // Translate to center node, if necessary
  const translateToNode = this.rootNodeIds && this.rootNodeIds.length === 1;
  if (translateToNode) zoom.translateGraphAroundId.bind(this)(this.rootNodeIds[0]);
  this.rootNodeIds = null;
}

/**
* Translate nodes from where they are currently displayed to their new calculated
* positions.
* @param {Transition || Selection} nodes - Object containing list of nodes to translate.
*/
export function setNodePositions(nodes) {
  nodes.attr('transform', (d) => { return `translate(${d.x},${d.y})`; });
}

/**
* Update links based on source and target node positions. Draw link from node edges
* as opposed to centers.
* @param {Transition || Selection} links - Object containing list of links to update.
*/
export function setLinkPositions(links) {
  links
    .each((l) => {
      const x1 = l.source.x,
            y1 = l.source.y,
            x2 = l.target.x,
            y2 = l.target.y;
      l.distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

      // 2.2 constant accounts for node stroke width, which is set in CSS
      const sourcePadding = l.target.radius + (l.bidirectional ? constants.MARKER_PADDING : 2.2),
            targetPadding = l.source.radius + constants.MARKER_PADDING;
      l.sourceX = x1 + (x2 - x1) * (l.distance - sourcePadding) / l.distance;
      l.sourceY = y1 + (y2 - y1) * (l.distance - sourcePadding) / l.distance;
      l.targetX = x2 - (x2 - x1) * (l.distance - targetPadding) / l.distance;
      l.targetY = y2 - (y2 - y1) * (l.distance - targetPadding) / l.distance;
    })
    .attr('d', (l) => { return 'M' + l.sourceX + ',' + l.sourceY + 'L' + l.targetX + ',' + l.targetY; });
}

/**
* Update position and angle of link texts. Ensure that link text background stays
* centered on link text. Hide link texts that are too short for the link.
*/
export function setLinkTextPositions() {
  // this.linkContainer.selectAll('.link-text')
  //         .attr('transform', aesthetics.rotateLinkText)
  //     .select('textPath')
  //         .each(aesthetics.hideLongLinkText);

  // this.link.attr('stroke-dasharray', aesthetics.createLinkTextBackground);
}
