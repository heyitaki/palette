import { ForceLink, Simulation, SimulationNodeDatum } from 'd3-force';
import { BaseType, select, Selection } from 'd3-selection';
import Server from '../server/Server';
import { LinkSelection, NodeSelection } from '../types';
import { loadGraphData, stopPropagation } from '../utils';
import AdjacencyMap from './AdjacencyMap';
import ContextMenu from './components/ContextMenu';
import Grid from './components/Grid';
import Link from './components/links/Link';
import { addLinkTitles, setLinkColor } from './components/links/utils';
import Node from './components/nodes/Node';
import { LINK_STROKE_WIDTH } from './constants/graph';
import NodeClass from './enums/NodeClass';
import Brush from './events/Brush';
import Drag from './events/Drag';
import { fastForceConvergence, initForce } from './events/force';
import { handleResize } from './events/resize';
import Zoom from './events/Zoom';
import { getAllLinks, getAllNodes } from './selection';
import { getNumLinksToExpand, isExpandable } from './state/expand';
import { classNodes } from './state/select';

export default class Graph {
  adjacencyMap: AdjacencyMap;
  brush: Brush;
  canvas: Selection<SVGGElement, any, HTMLElement, any>;
  container: Selection<SVGGElement, any, HTMLElement, any>;
  contextMenu: ContextMenu;
  defs: Selection<SVGDefsElement, any, HTMLElement, any>;
  drag: Drag;
  force: Simulation<SimulationNodeDatum, undefined>;
  grid: Grid;
  height: number;
  isModifierPressed: boolean;
  lastExpandedNodes: Node[];
  links: LinkSelection;
  linkContainer: Selection<SVGGElement, any, HTMLElement, any>;
  nodes: NodeSelection;
  nodeContainer: Selection<SVGGElement, any, HTMLElement, any>;
  server: Server;
  width: number;
  zoom: Zoom;

  /**
   * Initialize different components of the graph and selectors that are used in helper functions.
   * Adds root node and each of its neighbors to the graph as its starting state.
   * @param graphContainerId The ID to assign to the graph container
   */
  constructor(graphContainerId: string) {
    // Graph components
    this.canvas = select('#' + graphContainerId)
      .append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true)
      .on('click', () => {
        this.contextMenu.closeMenu();
        classNodes(this, this.nodes, NodeClass.Selected, false);
      });
    this.container = this.canvas.append('g').attr('class', 'graph');
    this.grid = new Grid(this, false);
    this.zoom = new Zoom(this);
    handleResize(this, graphContainerId);
    this.brush = new Brush(this);
    this.force = initForce(this);
    this.drag = new Drag(this);
    this.defs = this.canvas.append('defs');
    this.contextMenu = new ContextMenu(this);
    this.server = new Server();
    this.adjacencyMap = new AdjacencyMap(this);
    this.isModifierPressed = false;

    // Selectors
    this.linkContainer = this.container.append('g').attr('class', 'links');
    this.links = this.linkContainer.selectAll('.link-body');
    this.nodeContainer = this.container.append('g').attr('class', 'nodes');
    this.nodes = this.nodeContainer.selectAll('.node');

    // Display root node and neighbors
    this.zoom.translateGraphAroundPoint(0, 0);
    const root = this.server.getRoot();
    this.adjacencyMap.addNodes(root, false);
    this.lastExpandedNodes = [this.adjacencyMap.getNodes(root.id)[0]];
    loadGraphData(this, this.server.getNeighbors(root.id));
  }

  /**
   * Update the graph to reflect changes to the underlying adjacency map. New nodes/links are
   * added to the graph, and old nodes/links are removed. The force simulation is also fast-
   * forwarded to avoid scenarios in which graph cooling can take a long time.
   */
  update(): void {
    const nodes: Node[] = this.adjacencyMap.getNodes();
    const links: Link[] = this.adjacencyMap.getLinks();

    // Update node/link-based forces
    this.force.stop();
    this.force.nodes(nodes);
    this.force.force<ForceLink<Node, Link>>('link').links(links);

    // Update links, for new links, increment weights of source/target nodes.
    const linkSelection = this.links.data(links, (l: Link) => l.id);
    const linkEnter = linkSelection
      .enter()
      .append('g')
      .attr('class', 'link')
      .append('path')
      .attr('class', 'link-body')
      .attr('id', (l: Link) => `link-${l.id}`)
      .style('stroke-width', LINK_STROKE_WIDTH + 'px')
      .each((l: Link) => {
        l.source.weight++;
        l.target.weight++;
      });
    setLinkColor(this, linkEnter, '#545454');

    // For removed links, decrement weights of source/target nodes
    linkSelection
      .exit()
      .each((l: Link) => {
        l.source.weight--;
        l.target.weight--;
      })
      .remove();

    // Add link titles for new links
    const linkTitleEnter = addLinkTitles(this, linkSelection.enter());

    // Update nodes
    const nodeSelection = this.nodes.data(nodes, (n: Node) => n.id);
    const gNode = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', (n: Node) => `node-${n.id}`)
      .on('click', function (n, i) {
        n.onClick(n, i, this);
      })
      .on('dblclick', function (n, i) {
        n.onDoubleClick(n, i, this);
      })
      .on('mousedown', stopPropagation)
      .call(this.drag.get());
    gNode.each(function (n: Node) {
      n.renderNode(this);
    });
    nodeSelection.exit().remove();

    // Update selectors
    this.links = getAllLinks(this);
    this.nodes = getAllNodes(this);

    // Update node glyphs
    this.nodes.select('.node-glyph-top').classed('hidden', (n: Node) => !isExpandable(n));
    this.nodes
      .select('.node-glyph-top-text')
      .text((n: Node) => getNumLinksToExpand(n))
      .classed('hidden', (n: Node) => !isExpandable(n));

    // Fast-forward graph to stable state
    fastForceConvergence(this, linkEnter, linkTitleEnter);
  }
}
