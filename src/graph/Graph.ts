import { ForceLink, Simulation } from 'd3-force';
import { select } from 'd3-selection';
import Server from '../server/Server';
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
import { getAllLinkBodies, getAllLinks, getAllNodes, GraphSelections } from './selection';
import { getNumLinksToExpand, isExpandable } from './state/expand';
import { classNodes } from './state/select';

export default class Graph {
  adjacencyMap: AdjacencyMap;
  brush: Brush;
  contextMenu: ContextMenu;
  drag: Drag;
  force: Simulation<Partial<Node>, Link>;
  grid: Grid;
  height: number;
  isModifierPressed: boolean;
  lastExpandedNodes: Node[];
  refs: GraphSelections;
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
    this.refs = new GraphSelections();
    this.refs.canvasContainer = select('#' + graphContainerId)
      .append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true)
      .on('click', () => {
        this.contextMenu.closeMenu();
        classNodes(this, this.refs.nodes, NodeClass.Selected, false);
      });
    this.refs.graphContainer = this.refs.canvasContainer.append('g').attr('class', 'graph');
    this.grid = new Grid(this, false);
    this.zoom = new Zoom(this);
    handleResize(this, graphContainerId);
    this.brush = new Brush(this);
    this.force = initForce(this);
    this.drag = new Drag(this);
    this.refs.defs = this.refs.canvasContainer.append('defs');
    this.contextMenu = new ContextMenu(this);
    this.server = new Server();
    this.adjacencyMap = new AdjacencyMap(this);
    this.isModifierPressed = false;

    // Selectors
    this.refs.linkContainer = this.refs.graphContainer.append('g').attr('class', 'links');
    this.refs.nodeContainer = this.refs.graphContainer.append('g').attr('class', 'nodes');
    this.refs.linkBodies = getAllLinkBodies(this);
    this.refs.links = getAllLinks(this);
    this.refs.nodes = getAllNodes(this);

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
    // Fetch nodes and links that are currently visible
    const nodes: Node[] = this.adjacencyMap.getNodes();
    const links: Link[] = this.adjacencyMap.getLinks();

    // Update node/link-based forces
    this.force.stop();
    this.force.nodes(nodes);
    this.force.force<ForceLink<Node, Link>>('link').links(links);

    // Update links, for new links, increment weights of source/target nodes.
    const linkSelection = this.refs.links.data(links, (l: Link) => l.id);
    const newLinkBodies = linkSelection
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
    setLinkColor(this, newLinkBodies, '#545454');

    // For removed links, decrement weights of source/target nodes
    linkSelection
      .exit()
      .each((l: Link) => {
        l.source.weight--;
        l.target.weight--;
      })
      .remove();

    // Add link titles for new links
    const newLinkTitles = addLinkTitles(this, linkSelection.enter());

    // Update nodes
    const nodeSelection = this.refs.nodes.data(nodes, (n: Node) => n.id);
    const newNodes = nodeSelection
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
    newNodes.each(function (n: Node) {
      n.renderNode(this);
    });
    nodeSelection.exit().remove();

    // Update selectors
    this.refs.linkBodies = getAllLinkBodies(this);
    this.refs.links = getAllLinks(this);
    this.refs.nodes = getAllNodes(this);

    // Update node glyphs
    this.refs.nodes.select('.node-glyph-top').classed('hidden', (n: Node) => !isExpandable(n));
    this.refs.nodes
      .select('.node-glyph-top-text')
      .text((n: Node) => getNumLinksToExpand(n))
      .classed('hidden', (n: Node) => !isExpandable(n));

    // Fast-forward graph to stable state
    fastForceConvergence(this, newLinkBodies, newLinkTitles);
  }
}
