import { select } from "d3-selection";
import NodeData from "../../../server/NodeData";
import { NODE_THIN_CARD_HEIGHT } from "../../constants/graph";
import Card from "./Card";

export default class ThinCard extends Card {
  constructor(data: NodeData, height?: number, width?: number) {
    height = height || NODE_THIN_CARD_HEIGHT;
    super(data, height, width);
  }

  renderNode(gNodeRef) {
    const gNode = select(gNodeRef);
    const gNodeBody = gNode.append('g')
      .attr('class', 'node-body')
      // .on('mouseenter', function (d) { events.mouseenter.bind(self)(d, this); })
      // .on('mouseleave', function (d) { events.mouseleave.bind(self)(d, this); });

    gNodeBody.append('rect')
      .attr('class', 'node-body')
      .attr('width', this.length)
      .attr('height', this.height)
      .attr('rx', 5)
      .attr('ry', 5);
  }
}