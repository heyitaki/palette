import { select } from 'd3-selection';
import { initZoom } from './graph/events/zoom';
import { initBrush } from './graph/events/brush';
import { initForce } from './graph/force';

export default class Graph {
  svg;
  container;

  constructor(divId) {
    this.initGraph(divId);
  }

  initGraph(divId) {
    this.svg = select(divId).append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true);
    initZoom.bind(this)();
    initBrush.bind(this)();
    this.container = this.svg.append('g')
      .attr('class', 'graph-bois');
    initForce.bind(this)();
  }
  
  update() {

  }
}
