import { ForceLink, Simulation, SimulationNodeDatum } from 'd3-force';
import { BaseType, select, Selection } from 'd3-selection';
import AdjacencyMap from './graph/AdjacencyMap';
import ContextMenu from './graph/components/ContextMenu';
import Grid from './graph/components/Grid';
import Link, { setLinkColor } from './graph/components/links/Link';
import Node from './graph/components/nodes/Node';
import { LINK_STROKE_WIDTH } from './graph/constants/graph';
import NodeClass from './graph/enums/NodeClass';
import Brush from './graph/events/Brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { fastForceConvergence, initForce } from './graph/force';
import { getAllLinks, getAllNodes } from './graph/selection';
import { getNumLinksToExpand, isExpandable } from './graph/state/expand';
import { classNodes } from './graph/state/select';
import { hash } from './graph/utils';
import Server from './Server';
import { LinkSelection, NodeSelection } from './types';
import { stopPropagation } from './utils';

export default class Graph {
  adjacencyMap: AdjacencyMap;
  brush: Brush;
  clickedNodeId: string;
  container: Selection<SVGGElement, unknown, HTMLElement, any>;
  contextMenu: ContextMenu;
  defs: Selection<SVGDefsElement, unknown, HTMLElement, any>;
  doubleClickTimer;
  drag;
  fastConvergence: boolean;
  force: Simulation<SimulationNodeDatum, undefined>;
  grid: Grid;
  height: number;
  isModifierPressed: boolean;
  link: LinkSelection;
  linkContainer: Selection<SVGGElement, unknown, HTMLElement, any>;
  linkEnter: Selection<SVGPathElement, Link, SVGGElement, unknown>;
  linkText: Selection<BaseType, unknown, SVGGElement, unknown>;
  node: NodeSelection;
  nodeContainer: Selection<SVGGElement, unknown, HTMLElement, any>;
  server: Server;
  canvas: Selection<SVGGElement, unknown, HTMLElement, any>;
  width: number;

  constructor(graphContainerId: string) {
    // Double click handler 
    this.clickedNodeId = null;
    this.doubleClickTimer = null;

    this.isModifierPressed = false;
    this.fastConvergence = false;
    this.initGraph(graphContainerId);
  }

  private initGraph(graphContainerId: string) {
    // Graph components
    this.canvas = select('#' + graphContainerId).append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true)
      .on('click', () => {
        this.contextMenu.closeMenu();
        classNodes(this, this.node, NodeClass.Selected, false);
        clearTimeout(this.doubleClickTimer);
      });
    this.container = this.canvas.append('g')
      .attr('class', 'graph-bois');
    this.grid = new Grid(this, this.container);
    handleResize.bind(this)(graphContainerId);
    initZoom.bind(this)();
    this.brush = new Brush(this);
    this.force = initForce(this);
    initDrag.bind(this)();
    this.defs = this.canvas.append('defs');
    this.contextMenu = new ContextMenu(this);
    this.server = new Server();
    this.adjacencyMap = new AdjacencyMap(this);

    // Selectors
    this.linkContainer = this.container.append('g').attr('class', 'link-bois');
    this.linkText = this.linkContainer.selectAll('.link-text > textPath');
    this.link = this.linkContainer.selectAll('.link');
    this.nodeContainer = this.container.append('g').attr('class', 'node-bois');
    this.node = this.nodeContainer.selectAll('.node');

    // Display root node and neighbors 
    const root = this.server.getRoot();
    this.adjacencyMap.addNodes(root, true);
    // loadGraphData(this, this.server.getNeighbors(root.id));
  }

  updateGraph() {
    const nodes: Node[] = this.adjacencyMap.getNodes(),
          links: Link[] = this.adjacencyMap.getLinks();
          
    // Update node/link-based forces
    this.force.stop();
    this.force.nodes(nodes);
    this.force.force<ForceLink<Node, Link>>('link').links(links);
    
    // Update links, for each new link, increment weights of source and target nodes.
    const linkSelection = this.link.data(links, (l: Link) => l.id);
    this.linkEnter = linkSelection.enter().append('path')
      .attr('class', 'link')
      .attr('id', (l: Link) => `link-${hash(l.id)}`)
      .style('stroke-width', LINK_STROKE_WIDTH + 'px')
      .each((l: Link) => {
        l.source.weight++;
        l.target.weight++;
      });
    setLinkColor(this, this.linkEnter, '#545454');
  
    // For each removed link, decrement weights of source and target nodes
    linkSelection.exit()
      .each((l: Link) => {
        l.source.weight--;
        l.target.weight--;
      })
      .remove();
    
    // Update nodes
    const nodeSelection = this.node.data(nodes, (n: Node) => n.id);
    const gNode = nodeSelection.enter().append('g')
      .attr('class', 'node')
      .on('click', function (n, i) { n.onClick(n, i, this); })
      .on('dblclick', function (n, i) { n.onDoubleClick(n, i, this); })
      .on('mousedown', stopPropagation)
      .call(this.drag);
    gNode.each(function(n: Node) { n.renderNode(this); });
    nodeSelection.exit().remove();
  
    // Update selectors
    this.link = getAllLinks.bind(this)();
    this.node = getAllNodes.bind(this)();
  
    // Update node glyphs
    this.node.select('.node-glyph-top')
      .classed('hidden', (n: Node) => !isExpandable(n));
  
    this.node.select('.node-glyph-top-text')
      .text((n: Node) => getNumLinksToExpand(n))
      .classed('hidden', (n: Node) => !isExpandable(n));
  
    if (this.fastConvergence) fastForceConvergence(this);
    else this.force.restart();
  }
}
