import { select } from 'd3-selection';
import AdjacencyMap from './AdjacencyMap';
import { initGrid } from './graph/components/grid';
import { createContextMenu } from './graph/components/menu';
import { setNodeColor } from './graph/components/node';
import { NODE_RADIUS } from './graph/constants/graph';
import { initBrush } from './graph/events/brush';
import { initDrag } from './graph/events/drag';
import { handleResize } from './graph/events/resize';
import { initZoom } from './graph/events/zoom';
import { initForce } from './graph/force';
import { getAllLinks, getAllNodes } from './graph/selection';
import { getNumLinksToExpand, isExpandable } from './graph/state/expand';
import { hash } from './graph/utils';
import Server from './Server';
import { addNodes, addNodesByData } from './graph/state/add';

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

    // Display root node
    const root = this.server.getRoot();
    addNodesByData.bind(this)(root);
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

    const gNodeBody = gNode.append('g')
      .attr('class', 'node-body')
      // .on('mouseenter', function (d) { events.mouseenter.bind(self)(d, this); })
      // .on('mouseleave', function (d) { events.mouseleave.bind(self)(d, this); });

    gNodeBody.append('circle')
      .attr('class', 'node-body')
      .attr('r', NODE_RADIUS);

    gNodeBody.append('circle')
      .attr('class', 'node-glyph-top')
      .attr('r', 11)
      .attr('cx', 18)
      .attr('cy', -19);

    gNodeBody.append('text')
      .attr('class', 'node-glyph-top-text')
      .attr('dx', 18)
      .attr('dy', -14.5)
      .attr('text-anchor', 'middle')
      .classed('unselectable', true);

    gNodeBody.append('text')
      .attr('class', 'node-icon')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', '21px')
      .text((d) => { return ' '; }) //TODO
      .classed('unselectable', true);

    gNode.append('text')
      .attr('class', 'node-title')
      .attr('text-anchor', 'middle')
      .attr('dy', (NODE_RADIUS + 23.5).toString() + 'px')
      .classed('unselectable', true)
      .text((d) => { return d.title; })
      // .call(aesthetics.wrapNodeText.bind(this), this.printFull)
      // .on('click', this.stopPropagation)
      // .on('dblclick', this.stopPropagation)
      // .on('mouseenter', this.stopPropagation)
      // .on('mouseleave', this.stopPropagation)
      // .on('mouseover', this.stopPropagation)
      // .call(drag()
      //     .on('start', this.stopPropagation)
      //     .on('drag', this.stopPropagation)
      //     .on('end', this.stopPropagation)
      // );

    gNode.call(setNodeColor.bind(this), '#e3e3e3');
    this.node.exit().remove();

    // Update selectors
    this.link = getAllLinks.bind(this)();
    this.node = getAllNodes.bind(this)();

    // Update node glyphs
    this.node.select('.node-glyph-top')
      .classed('hidden', (d) => { return !isExpandable(d); });

    this.node.select('.node-glyph-top-text')
      .text((d) => { return getNumLinksToExpand(d); })
      .classed('hidden', (d) => { return !isExpandable(d); });
  }
}
