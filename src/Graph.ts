import { select } from 'd3-selection';
import AdjacencyMap from './AdjacencyMap';
import { initGrid } from './graph/components/grid';
import { createContextMenu } from './graph/components/menu';
import { initBrush } from './graph/events/brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { initForce } from './graph/force';
import { hash } from './graph/utils';
import Server from './Server';

export default class Graph {
  svg;
  container;
  force;
  drag;
  defs;
  contextMenu;
  server: Server;
  adjacencyMap: AdjacencyMap;
  linkContainer;
  linkText;
  link;
  linkEnter;
  nodeContainer;
  node;

  constructor(graphContainerId) {
    this.initGraph(graphContainerId);
  }

  initGraph(graphContainerId) {
    // Graph components
    this.svg = select('#' + graphContainerId).append('svg')
      .attr('id', 'graph-canvas')
      .attr('pointer-events', 'all')
      .classed('svg-content', true);
    handleResize.bind(this)(graphContainerId);
    initZoom.bind(this)();
    this.container = this.svg.append('g')
      .attr('class', 'graph-bois');
    initGrid.bind(this)();
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

    // Add and display root node
    const root = this.server.getRoot();
    this.adjacencyMap.addNodes(root);
    this.update();
  }
  
  update() {
    const nodes = this.adjacencyMap.getNodes(),
          links = this.adjacencyMap.getLinks();

    // Stop simulation while we update graph items
    this.force.stop();

    // Update node/link-based forces
    this.force
      .nodes(nodes)
      //.on('tick', this.ticked);
    this.force.force('link')
      .links(links);
    
    // Update links
    this.link = this.link.data(links, (l) => { return l.id; });
    this.linkEnter = this.link.enter().append('path')
      .attr('class', 'link')
      .attr('id', (l) => { return `link-${hash(l.id)}`; })
      .each((l) => {
        // Manually calculate d.weight for all nodes
        if (!l.source || !l.target) return;
        if (!l.source.weight) l.source.weight = 0;
        if (!l.target.weight) l.target.weight = 0;
        l.source.weight++;
        l.target.weight++;
      });
    
    // For each removed link, decrement weight of source and target nodes
    this.link.exit()
      .each((l) => {
        if (!l.source || !l.target) return;
        l.source.weight = l.source.weight ? Math.max(0, l.source.weight - 1) : 0;
        l.target.weight = l.target.weight ? Math.max(0, l.target.weight - 1) : 0;
      })
      .remove();
    
    // Update nodes
    this.node = this.node.data(nodes, (d) => { return d.id; });
    const gNode = this.node.enter().append('g')
      .attr('class', 'node')
      // .on('click', function (d) { events.clickWrapper.bind(self)(d, this); })
      // .on('dblclick', function (d) { events.dblclicked.bind(self)(d, this); })
      // .on('mousedown', function (d) { events.mousedown.bind(self)(d, this); })
      // .on('mouseover', function (d) { events.mouseover.bind(self)(d, this); })
      // .on('mouseout', function (d) { events.mouseout.bind(self)(d, this); })
      // .on('contextmenu', function (d, i, nodes) { events.rightclicked.bind(self)(...arguments, this); })
      .each((d) => { if (!d.weight) d.weight = 0; }) // Assign d.weight to free radicals
      .call(this.drag);
  }
}
