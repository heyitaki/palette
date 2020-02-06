import LinkData from "../../../server/LinkData";
import AdjacencyMap from "../../AdjacencyMap";
import { colorToHex } from "../../utils";
import Node from "../nodes/Node";

export default class Link {
  id: string;
  title: string;
  source: Node;
  target: Node;

  constructor(data: LinkData, map: AdjacencyMap) {
    this.id = data.id;
    this.title = data.title;
    this.source = map.getNodes(data.sourceId)[0];
    this.target = map.getNodes(data.targetId)[0];
  }
}

/**
 * Set link and link marker color.
 * @param link Selection of links to color
 * @param linkColor Color to set
 */
export function setLinkColor(link, linkColor: string) {
  if (!link || link.empty()) return;
  linkColor = colorToHex(linkColor);

  // If marker def doesn't exist for given color, create it.
  const id = `#defs-link-${linkColor.substring(1)}`;
  if (this.defs.select(id).empty()) {
    this.defs
      .append('marker')
        .attr('id', id.substring(1))
        .attr('viewBox', '5 -5 10 10')
        .attr('refX', 9)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
      .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .style('stroke', linkColor)
        .style('fill', linkColor)
        .style('fill-opacity', 1);
  }

  link
    .style('stroke', linkColor)
    .style('marker-end', `url(${id})`);
}
