import { select } from "d3-selection";
import NodeData from "../../../server/NodeData";
import { DISCONNECTED_LINK } from "../../constants/error";
import { NODE_CARD_HEIGHT, NODE_CARD_LENGTH } from "../../constants/graph";
import Point from "../../Point";
import Node from "./Node";

export default class Card implements Node {
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

    gNodeBody.append('rect')
      .attr('class', 'node-body')
      .attr('width', NODE_CARD_LENGTH)
      .attr('height', NODE_CARD_HEIGHT)
      .style('fill', 'rgba(0,0,0,0.3)');
  }

  public calcLinkPosition(l) {
    if (this.id != l.source.id && this.id != l.target.id) {
      console.error(DISCONNECTED_LINK, this, l);
      return;
    }
    
    const sourcePos = l.source.getCenter(),
          targetPos = l.target.getCenter(),
          x1 = sourcePos.x,
          y1 = sourcePos.y,
          x2 = targetPos.x,
          y2 = targetPos.y,
          dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
          slope = Math.abs((y1 - y2) / (x1 - x2));

    // By default, link stretches to node center, so we need to calculate
    // overlap between link and node (node edge to center)
    const overlap = (slope > (NODE_CARD_HEIGHT / NODE_CARD_LENGTH))
      ? dist * (NODE_CARD_HEIGHT / 2) / Math.abs(y1 - y2)
      : dist * (NODE_CARD_LENGTH / 2) / Math.abs(x1 - x2);

    // 2.2 constant accounts for node stroke width, which is set in CSS
    const padding = overlap; // + (l.bidirectional ? MARKER_PADDING : 2.2);
    if (this.id === l.source.id) {
      l.sourceX = x1 + (x2 - x1) * (dist - padding) / dist;
      l.sourceY = y1 + (y2 - y1) * (dist - padding) / dist;
    } else {
      l.targetX = x2 - (x2 - x1) * (dist - padding) / dist;
      l.targetY = y2 - (y2 - y1) * (dist - padding) / dist;
    }
  }

  public getCenter(): Point {
    return new Point(this.x + NODE_CARD_LENGTH / 2, this.y + NODE_CARD_HEIGHT / 2);
  }
}
