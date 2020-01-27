import { select } from "d3-selection";
import { NODE_CARD_HEIGHT, NODE_CARD_LENGTH } from "../../constants/graph";
import Point from "../../Point";

export default class Card {
  public static renderNode(gNodeRef) {
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

  public static calcLinkSourcePosition(l, isSource=true) {
    const 
          x1 = l.source.x,
          y1 = l.source.y,
          x2 = point.x,
          y2 = point.y,
          dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
          slope = Math.abs((y1 - y2) / (x1 - x2));

    // 2.2 constant accounts for node stroke width, which is set in CSS
    const overlap = (slope > (NODE_CARD_HEIGHT / NODE_CARD_LENGTH))
      ? dist * (NODE_CARD_HEIGHT / 2) / Math.abs(y1 - y2)
      : dist * (NODE_CARD_LENGTH / 2) / Math.abs(x1 - x2);
    const padding = overlap //+ (l.bidirectional ? MARKER_PADDING : 2.2);
    if (isSource) {
      l.sourceX = x1 + (x2 - x1) * (dist - padding) / dist;
      l.sourceY = y1 + (y2 - y1) * (dist - padding) / dist;
    } else {
      l.targetX = x2 - (x2 - x1) * (dist - padding) / dist;
      l.targetY = y2 - (y2 - y1) * (dist - padding) / dist;
    }
  }

  public static getCenter(n): Point {
    return new Point(n.x + NODE_CARD_LENGTH / 2, n.y + NODE_CARD_HEIGHT / 2);
  }

  public static toString() {
    return 'Card';
  }
}
