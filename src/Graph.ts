import { select } from 'd3-selection';
import AdjacencyMap from './graph/AdjacencyMap';
import Grid from './graph/components/Grid';
import { linkDataToLinkObj } from './graph/components/link';
import { createContextMenu } from './graph/components/menu';
import { nodeDataToNodeObj } from './graph/components/node';
import { initBrush } from './graph/events/brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { initForce } from './graph/force';
import { addLinks, addNodes } from './graph/state/add';
import Server from './Server';

export default class Graph {
  svg;
  container;
  force;
  drag;
  defs;
  contextMenu;
  width: number;
  height: number;
  grid: Grid;
  server: Server;
  adjacencyMap: AdjacencyMap;
  linkContainer;
  linkText;
  link;
  linkEnter;
  nodeContainer;
  node;

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
    initForce.bind(this)();
    initDrag.bind(this)();
    this.defs = this.svg.append('defs');
    this.contextMenu = createContextMenu.bind(this)();
    this.server = new Server();
    this.adjacencyMap = new AdjacencyMap();

    // Selectors
    this.linkContainer = this.container.append('g').attr('class', 'link-bois');
    this.linkText = this.linkContainer.selectAll('.link-text > textPath');
    this.link = this.linkContainer.selectAll('.link');
    this.nodeContainer = this.container.append('g').attr('class', 'node-bois');
    this.node = this.nodeContainer.selectAll('.node');

    // Display root node and neighbors
    const root = nodeDataToNodeObj(this.server.getRoot())[0];
    const neighbors = this.server.getNeighbors(root.id);
    
    const nodes = nodeDataToNodeObj(neighbors.nodes);
    addNodes.bind(this)(root, this.adjacencyMap, false);
    addNodes.bind(this)(nodes, this.adjacencyMap, false);

    const links = linkDataToLinkObj(neighbors.links, this.adjacencyMap);
    addLinks.bind(this)(links, this.adjacencyMap);
  }
}
