import { color } from 'd3-color';
import { select, selectAll } from 'd3-selection';
import {
  LinkBodySelection,
  LinkSelection,
  LinkTextPathSelection,
  LinkTitleSelection,
} from '../../../types';
import { toFunction } from '../../../utils';
import { LINK_TITLE_PADDING } from '../../constants/graph';
import Graph from '../../Graph';
import { getLinkTitles } from '../../selection';
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
  links: LinkBodySelection,
  linkColor: string | ((l?: Link) => string),
) {
  if (!links || links.empty()) return;
  const linkColorFn = toFunction(linkColor);
  links
    .style('stroke', (l: Link): string => {
      const linkColor: string = colorToHex(linkColorFn(l));

      // If marker def doesn't exist for given color, create it.
      const id: string = `#defs-link-${linkColor.substring(1)}`;
      if (graph.refs.defs.select(id).empty()) {
        graph.refs.defs
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

/**
 * Append link titles to all visible links.
 * @param graph Graph that contains links to add titles to
 * @param links Specific links to add titles to
 */
export const addLinkTitles = (graph: Graph, links: LinkSelection): LinkTitleSelection => {
  const linkTitleSelection = getLinkTitles(graph).data(
    (l: Link) => [l],
    (l: Link) => l.id,
  );

  const linkTitleEnter: LinkTitleSelection = linkTitleSelection
    .enter()
    .append('text')
    .attr('class', 'link-title')
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('transform', rotateLinkTitle);

  linkTitleEnter
    .append('textPath')
    .attr('id', (l: Link) => `text-${l.id}`)
    .attr('startOffset', '50%')
    .attr('xlink:href', (l: Link) => `#link-${l.id}`)
    .attr('length', (l: Link) => l.length)
    .text((l: Link) => l.title);

  graph.refs.linkBodies.attr('stroke-dasharray', (l: Link) => createLinkTitleBackground(graph, l));
  return linkTitleEnter;
};

/**
 * Ensures that the link title associated with the given link is always right side up by
 * calculating the transformation necessary to rotate the link title 180 degrees about its center
 * if necessary.
 * @param l Datum of link to calculate rotation of
 * @returns Transformation to rotate link title
 */
export const rotateLinkTitle = (l: Link): string => {
  // Do nothing if link doesn't have custom attributes or is forward-facing
  console.log(1, l.source.x, l.source.y);
  if (!l.source.x || !l.source.y || !l.target.x || !l.target.y || l.source.x < l.target.x) {
    console.log(2);
    return '';
  }
  console.log(3);
  // Calculate center of l and return rotation transform about center
  const centerX = l.source.x + (l.target.x - l.source.x) / 2;
  const centerY = l.source.y + (l.target.y - l.source.y) / 2;
  return `rotate(180 ${centerX} ${centerY})`;
};

/**
 * Because link titles are positioned on top of links, links will show underneath some letters. In
 * order to avoid this, we can either create a background rectangle behind the link title to hide
 * the link or hide that portion of the link that intersects with the link title. This method uses
 * approach #2 so as to not introduce more elements into the DOM.
 *
 * Additionally, hides the link title if it is longer than the length of the link that it is
 * attached to.
 *
 * TODO: change path to draw 2 separate lines as opposed to exploiting stroke-dasharray.
 * @param l Datum of link that link title is attached to
 */
export const createLinkTitleBackground = (graph: Graph, l: Link) => {
  // Select corresponding textPath of link by id, which is set in `addLinkTitles`
  const textPath: LinkTextPathSelection = graph.refs.linkContainer.select(`#text-${l.id}`);

  // Don't partition link if there is no corresponding textPath or if there is no title
  const numChars = textPath.node()?.getNumberOfChars();
  if (textPath.empty() || !textPath.text() || !numChars) return 'none';

  // Compute distance for displayed link partitions and space in between (where title shows)
  const textLength = textPath.node().getComputedTextLength() + numChars * 2 - 10;
  const lineLength = l.length - textLength;

  // Hide the link title if it is longer than the length of the link that it is attached to
  const isLonger = textLength > (l.length || 0) - LINK_TITLE_PADDING;
  textPath.classed('hidden', isLonger);
  if (isLonger) return 'none';

  // Account for padding in between text and link partitions
  return `${(lineLength - LINK_TITLE_PADDING) / 2} ${textLength + LINK_TITLE_PADDING}`;
};
