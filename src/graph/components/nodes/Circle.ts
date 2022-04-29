import { select } from 'd3-selection';
import NodeData from '../../../server/NodeData';
import { NodeSelection } from '../../../types';
import { DISCONNECTED_LINK } from '../../constants/error';
import { NODE_CIRCLE_RADIUS } from '../../constants/graph';
import PrintState from '../../enums/PrintState';
import Graph from '../../Graph';
import Point from '../../Point';
import { getDistance } from '../../utils';
import Link from '../links/Link';
import Node from './Node';
import { setNodeColor, wrapNodeText } from './utils';

export default class Circle extends Node {
  constructor(data: NodeData, graph: Graph) {
    super(data, graph);
  }

  public renderNode(gNodeRef: SVGElement) {
    const gNode: NodeSelection = select(gNodeRef);
    gNode.on('contextmenu', function (n, i) {
      n.onRightClick(n, i, this);
    });

    const gNodeBody = gNode.append('g').attr('class', 'node-body');
    // .on('mouseenter', function (d) { console.log(d); })
    // .on('mouseleave', function (d) { events.mouseleave.bind(self)(d, this); });

    gNodeBody.append('circle').attr('class', 'node-body').attr('r', NODE_CIRCLE_RADIUS);

    gNodeBody
      .append('circle')
      .attr('class', 'node-glyph-top')
      .attr('r', 11)
      .attr('cx', 18)
      .attr('cy', -19);

    gNodeBody
      .append('text')
      .attr('class', 'node-glyph-top-text')
      .attr('dx', 18)
      .attr('dy', -14.5)
      .attr('text-anchor', 'middle')
      .classed('unselectable', true);

    gNodeBody
      .append('text')
      .attr('class', 'node-icon')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', '21px')
      .text((n: Node) => '') // TODO: add icon
      .classed('unselectable', true);

    gNode
      .append('text')
      .attr('class', 'node-title')
      .attr('text-anchor', 'middle')
      .attr('dy', NODE_CIRCLE_RADIUS + 23.5 + 'px')
      .classed('unselectable', true)
      .text((n: Node) => n.title)
      .call(wrapNodeText, PrintState.Full);
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

    const sourcePos = l.source.getCenter();
    const targetPos = l.target.getCenter();
    const x1 = sourcePos.x;
    const y1 = sourcePos.y;
    const x2 = targetPos.x;
    const y2 = targetPos.y;
    const dist = getDistance(x1, y1, x2, y2);

    // Determine which end of the link we want to calculate new position for
    const scale = (n: number): number => (n * (dist - NODE_CIRCLE_RADIUS)) / dist;
    return this.id === l.target.id
      ? new Point(x1 + scale(x2 - x1), y1 + scale(y2 - y1))
      : new Point(x2 - scale(x2 - x1), y2 - scale(y2 - y1));
  }

  /**
   * Get the center of this node.
   */
  public getCenter(): Point {
    return new Point(this.x, this.y);
  }
}
