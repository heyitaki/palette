import Link, { setLinkColor } from "../components/links/Link";
import Node from "../components/nodes/Node";
import { LINK_STROKE_WIDTH } from "../constants/graph";
import { fastForceConvergence } from "../force";
import { getAllLinks, getAllNodes } from "../selection";
import { getNumLinksToExpand, isExpandable } from "../state/expand";
import { hash } from "../utils";
import { tick } from "./tick";

export function updateGraph() {
  const nodes: Node[] = this.adjacencyMap.getNodes(),
        links: Link[] = this.adjacencyMap.getLinks();

  // Stop simulation while we update graph items
  this.force.stop();

  // Update node/link-based forces
  this.force
    .nodes(nodes)
    .on('tick', tick.bind(this));

  this.force.force('link')
    .links(links);
  
  // Update links
  const linkSelection = this.link.data(links, l => l.id);
  this.linkEnter = linkSelection.enter().append('path')
    .attr('class', 'link')
    .attr('id', (l) => { return `link-${hash(l.id)}`; })
    .style('stroke-width', LINK_STROKE_WIDTH + 'px')
    .each((l) => {
      // Manually calculate d.weight for all nodes
      if (!l.source || !l.target) return;
      if (!l.source.weight) l.source.weight = 0;
      if (!l.target.weight) l.target.weight = 0;
      l.source.weight++;
      l.target.weight++;
    });
  this.linkEnter.call(setLinkColor.bind(this), '#545454');

  // For each removed link, decrement weight of source and target nodes
  linkSelection.exit()
    .each((l) => {
      if (!l.source || !l.target) return;
      l.source.weight = l.source.weight ? Math.max(0, l.source.weight - 1) : 0;
      l.target.weight = l.target.weight ? Math.max(0, l.target.weight - 1) : 0;
    })
    .remove();
  
  // Update nodes
  const nodeSelection = this.node.data(nodes, (d) => { return d.id; });
  const gNode = nodeSelection.enter().append('g')
    .attr('class', 'node')
    // .on('click', function (d) { events.clickWrapper.bind(self)(d, this); })
    // .on('dblclick', function (d) { events.dblclicked.bind(self)(d, this); })
    // .on('mousedown', function (d) { events.mousedown.bind(self)(d, this); })
    // .on('mouseover', function (d) { events.mouseover.bind(self)(d, this); })
    // .on('mouseout', function (d) { events.mouseout.bind(self)(d, this); })
    // .on('contextmenu', function (d, i, nodes) { events.rightclicked.bind(self)(...arguments, this); })
    .each((n) => { if (!n.weight) n.weight = 0; }) // Assign d.weight to free radicals
    .call(this.drag);

  gNode.each(function(n) { n.renderNode(this); });
  nodeSelection.exit().remove();

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
