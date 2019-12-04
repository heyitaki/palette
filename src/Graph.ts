import { select } from 'd3-selection';
import { initBrush } from './graph/events/brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { initForce } from './graph/force';
import { createContextMenu } from './graph/menu';
import AdjacencyMap from './AdjacencyMap';

export default class Graph {
  svg;
  container;
  defs;
  contextMenu;
  adjacencyMap;
  linkContainer;
  linkText;
  link;
  nodeContainer;
  node;

  constructor(graphContainerId) {
    this.initGraph(graphContainerId);
  }

  initGraph(graphContainerId) {
    // Graph components
    handleResize.bind(this)(graphContainerId);
    this.svg = select('#' + graphContainerId).append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true);
    initZoom.bind(this)();
    initBrush.bind(this)();
    this.container = this.svg.append('g')
      .attr('class', 'graph-bois');
    initForce.bind(this)();
    initDrag.bind(this)();
    this.defs = this.svg.append('defs');
    this.contextMenu = createContextMenu.bind(this)();
    this.adjacencyMap = new AdjacencyMap();

    // Selectors
    this.linkContainer = this.container.append('g').attr('class', 'link-bois');
    this.linkText = this.linkContainer.selectAll('.link-text > textPath');
    this.link = this.linkContainer.selectAll('.link');
    this.nodeContainer = this.container.append('g').attr('class', 'node-bois');
    this.node = this.nodeContainer.selectAll('.node');
  }
  
  update() {

  }
}
