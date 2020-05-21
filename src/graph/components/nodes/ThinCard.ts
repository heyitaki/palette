import { select } from "d3-selection";
import Graph from "../../../Graph";
import NodeData from "../../../server/NodeData";
import { NodeSelection } from "../../../types";
import { NODE_THIN_CARD_HEIGHT } from "../../constants/graph";
import Card from "./Card";
import { setNodeColor } from "./Node";

export default class ThinCard extends Card {
  constructor(data: NodeData, graph: Graph, height?: number, width?: number) {
    height = height || NODE_THIN_CARD_HEIGHT;
    super(data, graph, height, width);
  }

  renderNode(gNodeRef) {
    const gNode: NodeSelection = select(gNodeRef);
    gNode.on('contextmenu', function (n, i) { n.onRightClick(n, i, this); });
    
    const gNodeBody = gNode.append('g')
      .attr('class', 'node-body')
      // .on('mouseenter', function (d) { events.mouseenter.bind(self)(d, this); })
      // .on('mouseleave', function (d) { events.mouseleave.bind(self)(d, this); });

    gNodeBody.append('rect')
      .attr('class', 'node-body')
      .attr('x', -this.length/2)
      .attr('y', -this.height/2)
      .attr('width', this.length)
      .attr('height', this.height)
      .attr('rx', 2.5)
      .attr('ry', 2.5);

    gNodeBody.append('circle')
      .attr('class', 'node-glyph-top')
      .attr('r', 11)
      .attr('cx', this.length/2-2)
      .attr('cy', 4-this.height/2);

    gNodeBody.append('text')
      .attr('class', 'node-glyph-top-text')
      .attr('dx', this.length/2-2)
      .attr('dy', 8.25-this.height/2)
      .attr('text-anchor', 'middle')
      .classed('unselectable', true);
    
    gNodeBody.append('text')
      .attr('class', 'node-icon')
      .attr('font-size', '36px')
      .attr('x', -this.length/2+16)
      .attr('y', this.height/2-25)
      .text('📈')
      .classed('unselectable', true);
    
    gNodeBody.append('text')
      .attr('class', 'node-title on-body')
      .attr('font-size', '21px')
      .attr('font-weight', '100')
      .text(n => n.title)
      .classed('unselectable', true);
    
    setNodeColor(gNode);
  }
}