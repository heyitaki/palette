import { select } from "d3-selection";
import NodeData from "../../../server/NodeData";
import { DISCONNECTED_LINK } from "../../constants/error";
import { NODE_CARD_HEIGHT, NODE_CARD_LENGTH } from "../../constants/graph";
import Point from "../../Point";
import Link from "../links/Link";
import Node from "./Node";

export default class Card implements Node {
  id: string;
  type: string;
  title: string;
  weight: number;
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
    this.weight = 0;
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
      .attr('height', NODE_CARD_HEIGHT);
  }

  /**
   * Return position of link relating to this node. Link should be in line with 
   * centers of source and target nodes, but needs to be scaled back so marker 
   * doesn't overlap with node body.
   * @param l Link connected to this node to return position on node edge for 
   */
  public getLinkPosition(l: Link): Point {
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

    // Calculate overlap, which is dependent on whether the link crosses through
    // this node's length and height 
    const overlap = (slope > (NODE_CARD_HEIGHT / NODE_CARD_LENGTH))
      ? dist * (NODE_CARD_HEIGHT / 2) / Math.abs(y1 - y2)
      : dist * (NODE_CARD_LENGTH / 2) / Math.abs(x1 - x2);

    // Determine which end of the link we want to calculate new position for
    const scale = (n: number): number => n * (dist - overlap) / dist;
    return (this.id === l.target.id)
      ? new Point(x1 + scale(x2 - x1), y1 + scale(y2 - y1))
      : new Point(x2 - scale(x2 - x1), y2 - scale(y2 - y1));
  }

  /**
   * Get the center of this node. Note: SVG rectangles are drawn based on their
   * top left corner. 
   */
  public getCenter(): Point {
    return new Point(this.x + NODE_CARD_LENGTH / 2, this.y + NODE_CARD_HEIGHT / 2);
  }
}
