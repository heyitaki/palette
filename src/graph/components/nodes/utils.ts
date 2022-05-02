import { color } from 'd3-color';
import { select } from 'd3-selection';
import { NodeSelection, NodeTitleSelection } from '../../../types';
import { TYPES_TO_COLORS } from '../../constants/mappings';
import PrintState from '../../enums/PrintState';
import { getDataFromSelection } from '../../selection';
import { colorToHex } from '../../utils';
import Node from './Node';

/**
 * Retrieve color of given node, return custom color if given, otherwise return
 * type or default color.
 * @param node Node to get color of
 */
export function getNodeColor(node: Node) {
  const nodeColor = node.color,
    nodeType = node.type;
  if (nodeColor && nodeColor != '') {
    return color(nodeColor).toString();
  } else if (nodeType && TYPES_TO_COLORS[nodeType]) {
    return color(TYPES_TO_COLORS[nodeType]).toString();
  } else {
    return color('#545454').toString();
  }
}

/**
 * Set color of given node (and all components).
 * @param node Node to color
 * @param nodeColor Color to set
 */
export function setNodeColor(node: NodeSelection, nodeColor?: string) {
  if (!node) return;
  // Use given color if possible, otherwise default to color
  if (nodeColor && nodeColor != '') {
    nodeColor = colorToHex(nodeColor);
  } else {
    const nodeData = getDataFromSelection(node)[0];
    nodeColor = getNodeColor(nodeData);
  }

  // Color node using given color and background color
  node.select('.node-body').style('stroke', nodeColor).style('fill', nodeColor);
  node.select('.node-glyph-top').style('stroke', nodeColor).style('fill', '#fafafa');
  node.select('.node-glyph-top-text').style('stroke', nodeColor).style('fill', nodeColor);
  node.select('.node-icon').style('stroke', nodeColor).style('fill', '#fafafa');
}

/**
 * Wrap node labels if length exceeds the given width.
 * @param textSelection Element that will contain the tspans
 * @param printState Specify whether to abbreviate text, display full text, or hide text
 * @param width Max width of text
 */
export function wrapNodeText(
  textSelection: NodeTitleSelection,
  printState: PrintState,
  width: number = 100,
) {
  const LINE_HEIGHT = 17;
  textSelection.each(function (n: Node) {
    const text = select(this);
    const tokens = text.text().split(' ');
    text.text(null);

    let line = [];
    let remainder;
    let lineNum = 0;
    const dy = parseInt(text.attr('dy'), 10);
    const appendTspan = () => {
      return text
        .append('tspan')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', LINE_HEIGHT * lineNum++ + dy)
        .classed('unselectable', true);
    };

    let tspan = appendTspan();
    let i;
    for (i = 0; i < tokens.length; i++) {
      line.push(tokens[i]);
      tspan = tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        remainder = line.length > 1 ? line.pop() : null;
        tspan.text(line.join(' '));
        tspan = appendTspan();
        line = remainder ? [remainder] : [];
      }

      if (printState === PrintState.Abbreviated && lineNum > 0) {
        break;
      }
    }

    let finalLine = line.join(' ');
    finalLine =
      printState === PrintState.Abbreviated && i < tokens.length - 1
        ? `${finalLine.trim()}...`
        : finalLine;
    tspan.text(finalLine);
  });
}
