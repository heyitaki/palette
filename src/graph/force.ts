import { forceLink, forceManyBody, forceSimulation, forceX, forceY, Simulation, SimulationNodeDatum } from 'd3-force';
import 'd3-transition';
import Graph from '../Graph';
import { VELOCITY_DECAY } from './constants/graph';
import { setLinkPositions, setNodePositions, tick } from './events/tick';

export function initForce(graph: Graph): Simulation<SimulationNodeDatum, undefined> {
  return forceSimulation()
    .force('link', forceLink().distance(250).strength(1).iterations(7))
    .force('charge', forceManyBody().strength(-15000).distanceMax(10000).theta(0.75))
    .force('y', forceY().strength(0.2))
    .force('x', forceX().strength(0.2))
    .velocityDecay(VELOCITY_DECAY)
    .on('tick', tick.bind(graph))
    .stop();
}

/**
* Speeds up graph cooling. Calculate final stable positions of each node and then
* transition them from their current positions, so that we don't have to render
* every frame.
*/
export function fastForceConvergence(graph: Graph): void {
  const nodeTransitionMs = 500,
        linkTransitionMs = 75;

  // Necessary to not trigger rendering in ticked
  graph.fastConvergence = true;

  // Loop force.tick until graph is cooled
  graph.force.alpha(1).stop(); 
  while (graph.force.alpha() >= graph.force.alphaMin()) graph.force.tick();

  // Fade links out so we don't have to deal with/render them during the transition
  // aesthetics.removeLinkText.bind(graph)();
  graph.link.transition('link-opacity').duration(0).style('opacity', 0).remove();

  // Translate nodes over half a second
  const nodeInput = graph.node
    .transition('node-opacity').duration(nodeTransitionMs)
    .style('opacity', 1);

  // Wait for nodes to translate, then add links back
  const linkInput = graph.link
    .transition('link-opacity').delay(nodeTransitionMs).duration(linkTransitionMs)
    .style('opacity', 1)
    .on('end', () => { graph.fastConvergence = false; });

  setNodePositions.bind(graph)(nodeInput);
  setLinkPositions.bind(graph)(linkInput);
}
