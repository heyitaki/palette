import { colorToHex } from "../utils";
import { nodeTypeToClass } from "./node";

/**
 * Set link and link marker color.
 * @param link Selection of links to color
 * @param linkColor Color to set
 */
export function setLinkColor(link, linkColor: string) { console.log(link, linkColor)
  if (!link || link.empty()) return;
  linkColor = colorToHex(linkColor);

  const id = `#defs-link-${linkColor.substring(1)}`;
  if (this.defs.select(id).empty()) {
    this.defs
      .append('marker')
        .attr('id', id.substring(1))
        .attr('viewBox', '5 -5 10 10')
        .attr('refX', 10)
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
    .style('marker-end', (l) => {
      return `url(${id})`;
    });
}

export function calcLinkPosition(l) {
  const sourceNodeType = nodeTypeToClass(l.source.type);
  const targetNodeType = nodeTypeToClass(l.target.type);
  sourceNodeType.calcLinkPosition(l, true);
  targetNodeType.calcLinkPosition(l, false);
}
