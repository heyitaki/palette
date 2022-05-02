import { forceLink, forceManyBody, forceSimulation, forceX, forceY, Simulation } from 'd3-force';
import { interpolate } from 'd3-interpolate';
import { LinkBodySelection, LinkTitleSelection } from '../../types';
import { LINK_TRANSITION_DURATION, VELOCITY_DECAY } from '../constants/graph';
import Graph from '../Graph';
import Point from '../Point';
import { getDataFromSelection } from '../selection';
import { setLinkPositions, setLinkTextPositions, tick } from './tick';
import Node from '../components/nodes/Node';
import Link from '../components/links/Link';

/**
 * Create a force simulation for the graph. This is used to update the positions of nodes
 * at each tick.
 * @param graph Graph for which the created simulation will act upon
 * @returns Force simulation for the given graph
 */
export function initForce(graph: Graph): Simulation<Partial<Node>, Link> {
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
export async function fastForceConvergence(
  graph: Graph,
  newLinkBodies?: LinkBodySelection,
  newLinkTitles?: LinkTitleSelection,
): Promise<void> {
  // Get the current positions of all nodes
  const positions: { [id: string]: { initial?: Point; final?: Point } } = {};
  graph.refs.nodes.each((n) => {
    positions[n.id] = {};
    positions[n.id].initial = new Point(n.x, n.y);
  });

  // Loop force.tick until graph is cooled
  graph.force.alpha(1).stop();
  while (graph.force.alpha() >= graph.force.alphaMin()) graph.force.tick();

  // Get the final positions of all nodes
  graph.refs.nodes.each((n) => (positions[n.id].final = new Point(n.x, n.y)));

  // Hide new links and display them after final node/link positions have been calculated
  if (newLinkBodies) {
    newLinkBodies.style('display', 'none');
    newLinkBodies
      .transition('link-display')
      .delay(LINK_TRANSITION_DURATION)
      .duration(0)
      .style('display', 'block');
  }

  // Hide new link titles and display them after final node/link positions have been calculated
  if (newLinkTitles) {
    newLinkTitles.style('display', 'none');
    newLinkTitles
      .transition('link-title-display')
      .delay(LINK_TRANSITION_DURATION)
      .duration(0)
      .style('display', 'block')
      .on('end', () => setLinkTextPositions(graph));
  }

  // Center graph on root node
  // TODO: center around most recently expanded node, not root
  graph.zoom.translateGraphAroundNode(
    getDataFromSelection(graph.refs.nodes.filter((n) => n.id === '1'))[0],
  );

  // Update positions of nodes and links
  graph.refs.nodes
    .transition('node-transition')
    .duration(LINK_TRANSITION_DURATION)
    .attrTween('transform', function (d, i, nodes) {
      return function (t) {
        const currPos = interpolate(positions[d.id].initial, positions[d.id].final)(t);
        d.x = currPos.x;
        d.y = currPos.y;
        setLinkTextPositions(graph);
        return `translate(${currPos.x}, ${currPos.y})`;
      };
    });
  // setNodePositions(graph.nodes.transition('node-transition').duration(LINK_TRANSITION_DURATION));
  setLinkPositions(
    graph.refs.linkBodies.transition('link-transition').duration(LINK_TRANSITION_DURATION),
  );
  setLinkTextPositions(graph);
}
