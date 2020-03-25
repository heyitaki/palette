import { select } from "d3-selection";
import Graph from "../../../Graph";
import NodeData from "../../../server/NodeData";
import { NodeSelection } from "../../../types";
import { NODE_THIN_CARD_HEIGHT } from "../../constants/graph";
import Card from "./Card";
import { setNodeColor } from "./Node";

export default class ThinCard extends Card {
  constructor(graph: Graph, data: NodeData, height?: number, width?: number) {
    height = height || NODE_THIN_CARD_HEIGHT;
    super(graph, data, height, width);
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
      .attr('width', this.length)
      .attr('height', this.height)
      .attr('rx', 2.5)
      .attr('ry', 2.5);
    
    setNodeColor(gNode);
  }
}