import { color } from "d3-color";
import Graph from "../../../Graph";
import LinkData from "../../../server/LinkData";
import { LinkSelection } from "../../../types";
import { toFunction } from "../../../utils";
import AdjacencyMap from "../../AdjacencyMap";
import { colorToHex } from "../../utils";
import Node from "../nodes/Node";

export default class Link {
  id: string;
  color: string;
  possible: boolean;
  selected: boolean;
  source: Node;
  target: Node;
  title: string;

  constructor(data: LinkData, map: AdjacencyMap) {
    this.id = data.id;
    this.title = data.title;
    this.color = '#545454';
    this.possible = false;
    this.selected = false;
    this.source = map.getNodes(data.sourceId)[0];
    this.target = map.getNodes(data.targetId)[0];
  }
}

/**
 * Retrieve color of given link, return custom color if given, otherwise return
 * default color.
 * @param link Link to get color of
 */
export function getLinkColor(link: Link) {
  if (link.possible) return color('#519dea').toString();
  else if (link.selected) return color('#0d77e2').toString();
  else return color(link.color).toString();
}

/**
 * Set link and link marker color.
 * @param links Selection of links to color
 * @param linkColor Color to set
 */
export function setLinkColor(graph: Graph, links: LinkSelection, 
    linkColor: string | ((l?: Link) => string)) {
  if (!links || links.empty()) return;
  const linkColorFn = toFunction(linkColor);
  links
    .style('stroke', (l: Link): string => {
      const linkColor: string = colorToHex(linkColorFn(l));

      // If marker def doesn't exist for given color, create it.
      const id: string = `#defs-link-${linkColor.substring(1)}`;
      if (graph.defs.select(id).empty()) {
        graph.defs
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

      return linkColor;
    })
    .style('marker-end', (l: Link) => {
      const linkColor: string = colorToHex(linkColorFn(l));
      const id: string = `#defs-link-${linkColor.substring(1)}`;
      return `url(${id})`;
    });
}
