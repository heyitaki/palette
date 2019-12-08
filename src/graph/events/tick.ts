import { MARKER_PADDING } from "../constants/graph";

export function tick() {
  console.log('tick')
  setNodePositions.bind(this)(this.node);
}

/**
* Translate nodes from where they are currently displayed to their new calculated
* positions.
* @param {Transition || Selection} nodes - Object containing list of nodes to translate.
*/
export function setNodePositions(nodes) {
  nodes.attr('transform', (d) => { return `translate(${d.x},${d.y})`; });
}

/**
* Update links based on source and target node positions. Draw link from node edges
* as opposed to centers.
* @param {Transition || Selection} links - Object containing list of links to update.
*/
export function setLinkPositions(links) {
  links
    .each((l) => {
      const x1 = l.source.x,
            y1 = l.source.y,
            x2 = l.target.x,
            y2 = l.target.y;
      l.distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

      // 2.2 constant accounts for node stroke width, which is set in CSS
      const sourcePadding = l.target.radius + (l.bidirectional ? MARKER_PADDING : 2.2),
            targetPadding = l.source.radius + MARKER_PADDING;
      l.sourceX = x1 + (x2 - x1) * (l.distance - sourcePadding) / l.distance;
      l.sourceY = y1 + (y2 - y1) * (l.distance - sourcePadding) / l.distance;
      l.targetX = x2 - (x2 - x1) * (l.distance - targetPadding) / l.distance;
      l.targetY = y2 - (y2 - y1) * (l.distance - targetPadding) / l.distance;
    })
    .attr('d', (l) => { return 'M' + l.sourceX + ',' + l.sourceY + 'L' + l.targetX + ',' + l.targetY; });
}

/**
* Update position and angle of link texts. Ensure that link text background stays
* centered on link text. Hide link texts that are too short for the link.
*/
export function setLinkTextPositions() {
  // this.linkContainer.selectAll('.link-text')
  //         .attr('transform', aesthetics.rotateLinkText)
  //     .select('textPath')
  //         .each(aesthetics.hideLongLinkText);

  // this.link.attr('stroke-dasharray', aesthetics.createLinkTextBackground);
}
