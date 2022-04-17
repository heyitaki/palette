import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  Simulation,
  SimulationNodeDatum,
} from 'd3-force';
import { LinkSelection } from '../../types';
import { VELOCITY_DECAY } from '../constants/graph';
import Graph from '../Graph';
import { getDataFromSelection } from '../selection';
import { setLinkPositions, setNodePositions, tick } from './tick';

/**
 * Create a force simulation for the graph. This is used to update the positions of nodes
 * at each tick.
 * @param graph Graph for which the created simulation will act upon
 * @returns Force simulation for the given graph
 */
export function initForce(graph: Graph): Simulation<SimulationNodeDatum, undefined> {
  return forceSimulation()
    .force('link', forceLink().distance(200).strength(1).iterations(3))
    .force('charge', forceManyBody().strength(-15000).distanceMax(10000).theta(0.75))
    .force('y', forceY().strength(0.2))
    .force('x', forceX().strength(0.2))
    .velocityDecay(VELOCITY_DECAY)
    .on('tick', () => tick(graph))
    .stop();
}

/**
 * Speeds up graph cooling. Calculate final stable positions of each node and then
 * transition them from their current positions, so that we don't have to render
 * every frame.
 * @param graph Graph that is being fast-forwarded
 */
export async function fastForceConvergence(graph: Graph, newLinks?: LinkSelection): Promise<void> {
  const DURATION_MS = 400;

  // Loop force.tick until graph is cooled
  graph.force.alpha(1).stop();
  while (graph.force.alpha() >= graph.force.alphaMin()) graph.force.tick();

  // Hide new links and display them after final node/link positions have been calculated
  if (newLinks) {
    // aesthetics.removeLinkText.bind(graph)();
    newLinks.style('display', 'none');
    newLinks.transition('link-display').delay(DURATION_MS).duration(0).style('display', '');
  }

  // Center graph on root node
  // TODO: center around most recently expanded node, not root
  graph.zoom.translateGraphAroundNode(
    getDataFromSelection(graph.nodes.filter((n) => n.id === '1'))[0],
  );

  // Update positions of nodes and links
  setNodePositions(graph.nodes.transition('node-transition').duration(DURATION_MS));
  setLinkPositions(graph.links.transition('link-transition').duration(DURATION_MS));
}
