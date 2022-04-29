import { color } from 'd3-color';
import { select, selectAll } from 'd3-selection';
import { LinkSelection } from '../../../types';
import { toFunction } from '../../../utils';
import Graph from '../../Graph';
import { colorToHex, getDistance } from '../../utils';
import Link from './Link';

/**
 * Retrieve color of given link, return custom color if given, otherwise return
 * default color.
 * @param link Link to get color of
 */
export function getLinkColor(link: Link) {
  if (link.possible) {
    return color('#519dea').toString();
  } else if (link.selected) {
    return color('#0d77e2').toString();
  } else {
    return color(link.color).toString();
  }
}

/**
 * Set link and link marker color.
 * @param links Selection of links to color
 * @param linkColor Color to set
 */
export function setLinkColor(
  graph: Graph,
  links: LinkSelection,
  linkColor: string | ((l?: Link) => string),
) {
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

export const addLinkText = (graph: Graph, links: Link[]) => {
  const linkTitles = selectAll('.link')
    .selectAll('.link-title')
    .data(
      (l: Link) => {
        console.log(l);
        return [l];
      },
      (l: Link) => l.id,
    );

  linkTitles
    .enter()
    .append('text')
    .attr('class', 'link-title')
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('transform', rotateLinkText)
    .append('textPath')
    .attr('startOffset', '50%')
    .attr('xlink:href', (l: Link) => `#link-${l.id}`)
    .attr('length', (l: Link) => l.length)
    .text((l: Link) => l.title)
    .each(hideLongLinkText);
  // .style('opacity', 0);
};

export const rotateLinkText = (l: Link) => {
  // Do nothing if link doesn't have custom attributes or is forward-facing
  if (!l.source.x || !l.source.y || !l.target.x || !l.target.y || l.source.x < l.target.x)
    return '';

  // Calculate center of l and return rotation transform about center
  const centerX = l.source.x + (l.target.x - l.source.x) / 2;
  const centerY = l.source.y + (l.target.y - l.source.y) / 2;
  return `rotate(180 ${centerX} ${centerY})`;
};

export function hideLongLinkText(l: Link) {
  const textPath = select(this);
  const textLength =
    textPath.node().getComputedTextLength() + textPath.node().getNumberOfChars() * 2 - 10;
  const pathLength = getDistance(l.source.x, l.source.y, l.target.x, l.target.y);
  textPath.classed('hidden', textLength > pathLength - 15);
}
