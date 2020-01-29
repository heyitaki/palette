import { colorToHex } from "../utils";

/**
 * Set link and link marker color.
 * @param link Selection of links to color
 * @param linkColor Color to set
 */
export function setLinkColor(link, linkColor: string) {
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
    .style('marker-end', `url(${id})`);
}

export function calcLinkPosition(l) { //console.log("source",l.source); console.log("target", l.target)
  l.target.calcLinkPosition(l, true);
  l.source.calcLinkPosition(l, false);
}
