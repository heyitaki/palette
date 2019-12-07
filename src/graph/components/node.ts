import { color } from 'd3-color';
import { select } from 'd3-selection';

/**
 * Set node (and all components) color.
 * @param node Node to color
 * @param nodeColor Color to set
 */
export function setNodeColor(node, nodeColor: string) {
  if (!node) return;
  // Normalize input color
  const parsedColor = color(nodeColor).toString();

  // Color node using given color and background color
  node.select('.node-body')
      .style('stroke', parsedColor)
      .style('fill', parsedColor);

  node.select('.node-glyph-top')
      .style('stroke', parsedColor)
      .style('fill', '#fafafa');

  node.select('.node-glyph-top-text')
      .style('stroke', parsedColor)
      .style('fill', parsedColor);
    
  node.select('.node-icon')
      .style('stroke', parsedColor)
      .style('fill', '#fafafa');
}

/**
 * Wrap long node labels. printFull states => abbrev, full, none
 * @param textSelection Element containing tspans
 * @param printFull Whether to abbreviate text, display full text, or hide text
 * @param width Max width of text
 */
export function wrapNodeText(textSelection, printFull, width=100) {
  if (printFull != 'abbrev' && printFull != 'full') return;
  const lineHeight = 17;
  textSelection.each(function (d) {
    const text = select(this);
    const tokens = text.text().split(' ');
    text.text(null);

    let line = [];
    let remainder;
    let lineNum = 0;
    const dy = parseInt(text.attr('dy'), 10);
    let tspan = text.append('tspan')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('dy', dy)
                    .classed('unselectable', true);

    let i;
    for (i = 0; i < tokens.length; i++) {
      line.push(tokens[i]);
      tspan = tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        remainder = (line.length > 1) ? line.pop() : null;
        tspan.text(line.join(' '));
        tspan = text.append('tspan')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('dy', lineHeight * (++lineNum) + dy)
                    .classed('unselectable', true);

        line = remainder ? [remainder] : [];
      }

      if (printFull === 0 && lineNum > 0) {
        break;
      }
    }

    let finalLine = line.join(' ');
    finalLine = (printFull === 0 && i < tokens.length-1) ? `${finalLine.trim()}...` : finalLine;
    tspan.text(finalLine);
  });
}
