import { select } from 'd3-selection';
import NodeData from '../../../server/NodeData';
import { NodeSelection } from '../../../types';
import { DISCONNECTED_LINK } from '../../constants/error';
import { NODE_CARD_HEIGHT, NODE_CARD_LENGTH } from '../../constants/graph';
import Graph from '../../Graph';
import Point from '../../Point';
import Link from '../links/Link';
import Node, { setNodeColor } from './Node';

export default class Card extends Node {
  height: number;
  length: number;

  constructor(data: NodeData, graph: Graph, height?: number, length?: number) {
    super(data, graph);
    this.height = height || NODE_CARD_HEIGHT;
    this.length = length || NODE_CARD_LENGTH;
  }

  public renderNode(gNodeRef) {
    const gNode: NodeSelection = select(gNodeRef);
    gNode.on('contextmenu', function (n, i) {
      n.onRightClick(n, i, this);
    });

    const gNodeBody = gNode.append('g').attr('class', 'node-body');
    // .on('mouseenter', function (d) { events.mouseenter.bind(self)(d, this); })
    // .on('mouseleave', function (d) { events.mouseleave.bind(self)(d, this); });

    gNodeBody
      .append('rect')
      .attr('class', 'node-body')
      .attr('x', -this.length / 2)
      .attr('y', -this.height / 2)
      .attr('width', this.length)
      .attr('height', this.height)
      .attr('rx', 2.5)
      .attr('ry', 2.5);

    gNodeBody
      .append('circle')
      .attr('class', 'node-glyph-top')
      .attr('r', 11)
      .attr('cx', this.length / 2 - 2)
      .attr('cy', 4 - this.height / 2);

    gNodeBody
      .append('text')
      .attr('class', 'node-glyph-top-text')
      .attr('dx', this.length / 2 - 2)
      .attr('dy', 8.25 - this.height / 2)
      .attr('text-anchor', 'middle')
      .classed('unselectable', true);

    setNodeColor(gNode);
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
    const overlap =
      slope > this.height / this.length
        ? (dist * (this.height / 2)) / Math.abs(y1 - y2)
        : (dist * (this.length / 2)) / Math.abs(x1 - x2);

    // Determine which end of the link we want to calculate new position for
    const scale = (n: number): number => (n * (dist - overlap)) / dist;
    return this.id === l.target.id
      ? new Point(x1 + scale(x2 - x1), y1 + scale(y2 - y1))
      : new Point(x2 - scale(x2 - x1), y2 - scale(y2 - y1));
  }

  /**
   * Get the center of this node. Note: SVG rectangles are drawn based on their
   * top left corner.
   */
  public getCenter(): Point {
    return new Point(this.x, this.y);
  }
}
