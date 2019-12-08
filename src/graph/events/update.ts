import { setNodeColor, wrapNodeText } from "../components/node";
import { NODE_RADIUS } from "../constants/graph";
import { getAllLinks, getAllNodes } from "../selection";
import { getNumLinksToExpand, isExpandable } from "../state/expand";
import { hash } from "../utils";
import { tick } from "./tick";
import { fastForceConvergence } from "../force";

export function updateGraph() {
  const nodes = this.adjacencyMap.getNodes(),
        links = this.adjacencyMap.getLinks(); console.log(nodes, links)

  // Stop simulation while we update graph items
  this.force.stop();

  // Update node/link-based forces
  this.force
    .nodes(nodes)
    .on('tick', tick.bind(this));

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
    .call(wrapNodeText.bind(this), 'abbrev')
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

  gNode.call(setNodeColor.bind(this));
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

  if (this.fastConvergence) fastForceConvergence.bind(this)();
  else this.force.restart();
}