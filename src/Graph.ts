import { ForceLink, Simulation, SimulationNodeDatum } from 'd3-force';
import { BaseType, select, Selection } from 'd3-selection';
import AdjacencyMap from './graph/AdjacencyMap';
import ContextMenu from './graph/components/ContextMenu';
import Grid from './graph/components/Grid';
import Link, { setLinkColor } from './graph/components/links/Link';
import Node from './graph/components/nodes/Node';
import { LINK_STROKE_WIDTH } from './graph/constants/graph';
import { initBrush } from './graph/events/brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { fastForceConvergence, initForce } from './graph/force';
import { getAllLinks, getAllNodes } from './graph/selection';
import { getNumLinksToExpand, isExpandable } from './graph/state/expand';
import { hash } from './graph/utils';
import Server from './Server';
import { loadGraphData } from './utils';

export default class Graph {
  adjacencyMap: AdjacencyMap;
  container: Selection<SVGGElement, unknown, HTMLElement, any>;
  contextMenu: ContextMenu;
  defs: Selection<SVGDefsElement, unknown, HTMLElement, any>;
  drag;
  fastConvergence: boolean;
  force: Simulation<SimulationNodeDatum, undefined>;
  grid: Grid;
  height: number;
  link: Selection<BaseType, unknown, SVGGElement, unknown>;
  linkContainer: Selection<SVGGElement, unknown, HTMLElement, any>;
  linkEnter: Selection<SVGPathElement, Link, SVGGElement, unknown>;
  linkText: Selection<BaseType, unknown, SVGGElement, unknown>;
  node: Selection<any, any, SVGGElement, unknown>;
  nodeContainer: Selection<SVGGElement, unknown, HTMLElement, any>;
  server: Server;
  svg: Selection<BaseType, unknown, HTMLElement, any>;
  width: number;

  constructor(graphContainerId: string) {
    this.initGraph(graphContainerId);
  }

  private initGraph(graphContainerId: string) {
    // Graph components
    this.svg = select('#' + graphContainerId).append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true);
    this.container = this.svg.append('g')
      .attr('class', 'graph-bois');
    this.grid = new Grid(this, this.container);
    handleResize.bind(this)(graphContainerId);
    initZoom.bind(this)();
    initBrush.bind(this)();
    this.force = initForce(this);
    initDrag.bind(this)();
    this.defs = this.svg.append('defs');
    this.contextMenu = new ContextMenu(this);
    this.server = new Server();
    this.adjacencyMap = new AdjacencyMap(this);
    this.fastConvergence = false;

    // Selectors
    this.linkContainer = this.container.append('g').attr('class', 'link-bois');
    this.linkText = this.linkContainer.selectAll('.link-text > textPath');
    this.link = this.linkContainer.selectAll('.link');
    this.nodeContainer = this.container.append('g').attr('class', 'node-bois');
    this.node = this.nodeContainer.selectAll('.node');

    // Display root node and neighbors 
    const root = this.server.getRoot();
    this.adjacencyMap.addNodes(root, false);
    loadGraphData(this, this.server.getNeighbors(root.id));
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
      .attr('id', (l: Link) => { return `link-${hash(l.id)}`; })
      .style('stroke-width', LINK_STROKE_WIDTH + 'px')
      .each((l: Link) => {
        l.source.weight++;
        l.target.weight++;
      });
    this.linkEnter.call(setLinkColor.bind(this), '#545454');
  
    // For each removed link, decrement weights of source and target nodes
    linkSelection.exit()
      .each((l: Link) => {
        l.source.weight--;
        l.target.weight--;
      })
      .remove();
    
    // Update nodes
    const nodeSelection = this.node.data(nodes, (n: Node) => { return n.id; });
    const gNode = nodeSelection.enter().append('g')
      .attr('class', 'node')
      // .on('click', function (d) { events.clickWrapper.bind(self)(d, this); })
      // .on('dblclick', function (d) { events.dblclicked.bind(self)(d, this); })
      // .on('mousedown', function (d) { events.mousedown.bind(self)(d, this); })
      // .on('mouseover', function (d) { events.mouseover.bind(self)(d, this); })
      // .on('mouseout', function (d) { events.mouseout.bind(self)(d, this); })
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
