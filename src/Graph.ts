import {select} from 'd3-selection';
import { initZoom } from './graph/events/zoom';
import { initBrush } from './graph/events/brush';

export default class Graph {
  svg;

  constructor(divId) {
    this.initGraph(divId);
  }

  initGraph(divId) {
    this.svg = select(divId).append('svg')
      .attr('id', 'graph-boi')
      .attr('pointer-events', 'all')
      .classed('svg-content', true);
    initZoom.bind(this)();
    initBrush.bind(this)();
  }
  
  update() {

  }
}