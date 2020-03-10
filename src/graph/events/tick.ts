import Link from "../components/links/Link";

export function tick() {
  setNodePositions.bind(this)(this.node);
  setLinkPositions.bind(this)(this.link);
}

/**
* Translate nodes from where they are currently displayed to their new calculated
* positions.
* @param {Transition || Selection} nodes - Object containing list of nodes to translate.
*/
export function setNodePositions(nodes) {
  nodes.attr('transform', d => `translate(${d.x},${d.y})`);
}

/**
* Update links based on source and target node positions. Draw link from node edges
* as opposed to centers.
* @param {Transition || Selection} links - Object containing list of links to update.
*/
export function setLinkPositions(links) {
  links.attr('d', (l: Link): string => { 
    const sourcePos = l.source.getLinkPosition(l),
          targetPos = l.target.getLinkPosition(l);
    return 'M' + sourcePos.x + ',' + sourcePos.y + 'L' + targetPos.x + ',' + targetPos.y;
  });
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