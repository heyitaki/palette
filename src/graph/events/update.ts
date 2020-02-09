import Link, { setLinkColor } from "../components/links/Link";
import Node from "../components/nodes/Node";
import { LINK_STROKE_WIDTH } from "../constants/graph";
import { fastForceConvergence } from "../force";
import { getAllLinks, getAllNodes } from "../selection";
import { getNumLinksToExpand, isExpandable } from "../state/expand";
import { hash } from "../utils";

export function updateGraph() {
  const nodes: Node[] = this.adjacencyMap.getNodes(),
        links: Link[] = this.adjacencyMap.getLinks();
        
  // Update node/link-based forces
  this.force.stop();
  this.force.nodes(nodes);
  this.force.force('link').links(links);
  
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
    // .on('contextmenu', function (d, i, nodes) { events.rightclicked.bind(self)(...arguments, this); })
    .call(this.drag);
  gNode.each(function(n: Node) { n.renderNode(this); });
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
