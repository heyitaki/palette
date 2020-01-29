import { select } from "d3-selection";
import { NODE_CIRCLE_RADIUS } from "../../constants/graph";
import Point from "../../Point";
import { setNodeColor, wrapNodeText } from "../node";
import Node from "./Node";
import NodeData from "./NodeData";

export default class Circle implements Node {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  color?: string;
  x?: number;
  y?: number;
  
  constructor(data: NodeData) {
    this.id = data.id;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.url = data.url;
    this.color = data.color;
    this.x = data.x;
    this.y = data.y;
  }

  public renderNode(gNodeRef) {
    const gNode = select(gNodeRef);
    const gNodeBody = gNode.append('g')
      .attr('class', 'node-body')
      // .on('mouseenter', function (d) { events.mouseenter.bind(self)(d, this); })
      // .on('mouseleave', function (d) { events.mouseleave.bind(self)(d, this); });

    gNodeBody.append('circle')
      .attr('class', 'node-body')
      .attr('r', NODE_CIRCLE_RADIUS)
      .style('fill', 'rgba(0,0,0,0.3)');

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
      .attr('dy', (NODE_CIRCLE_RADIUS + 23.5).toString() + 'px')
      .classed('unselectable', true)
      .text((n: any) => { return n.title; })
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
  }
  
  public calcLinkPosition(l, isSource=true) {
    const sourcePos = l.source.getCenter(),
          targetPos = l.target.getCenter(),
          x1 = sourcePos.x,
          y1 = sourcePos.y,
          x2 = targetPos.x,
          y2 = targetPos.y,
          dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

    // 2.2 constant accounts for node stroke width, which is set in CSS
    const padding = NODE_CIRCLE_RADIUS //+ (l.bidirectional ? MARKER_PADDING : 2.2);
    if (isSource) {
      l.sourceX = x1 + (x2 - x1) * (dist - padding) / dist;
      l.sourceY = y1 + (y2 - y1) * (dist - padding) / dist;
    } else {
      l.targetX = x2 - (x2 - x1) * (dist - padding) / dist;
      l.targetY = y2 - (y2 - y1) * (dist - padding) / dist;
    }
  }

  public getCenter(): Point {
    return new Point(this.x, this.y);
  }
}
