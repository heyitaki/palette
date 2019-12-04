import { select } from 'd3-selection';
import { initBrush } from './graph/events/brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { initForce } from './graph/force';
import { createContextMenu } from './graph/menu';

export default class Graph {
  svg;
  container;
  defs;
  contextMenu;

  constructor(graphContainerId) {
    this.initGraph(graphContainerId);
  }

  initGraph(graphContainerId) {
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
  }
  
  update() {

  }
}
