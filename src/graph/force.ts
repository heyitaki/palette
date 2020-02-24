import { forceLink, forceManyBody, forceSimulation, forceX, forceY, Simulation, SimulationNodeDatum } from 'd3-force';
import { VELOCITY_DECAY } from './constants/graph';
import { setLinkPositions, setNodePositions, tick } from './events/tick';
import { translateGraphAroundId } from './events/zoom';

export function initForce(): Simulation<SimulationNodeDatum, undefined> {
  return forceSimulation()
    .force('link', forceLink().distance(250).strength(1).iterations(7))
    .force('charge', forceManyBody().strength(-15000).distanceMax(10000).theta(0.75))
    .force('y', forceY().strength(0.2))
    .force('x', forceX().strength(0.2))
    .velocityDecay(VELOCITY_DECAY)
    .on('tick', tick.bind(this))
    .stop();
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
  while (this.force.alpha() >= this.force.alphaMin()) this.force.tick();

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
  if (translateToNode) translateGraphAroundId.bind(this)(this.rootNodeIds[0]);
  this.rootNodeIds = null;
}
