import { color } from "d3-color";
import { select } from "d3-selection";
import Graph from "../../../Graph";
import NodeData from "../../../server/NodeData";
import { TYPES_TO_COLORS } from "../../constants/mappings";
import Point from "../../Point";
import { getDataFromSelection } from "../../selection";
import { colorToHex } from "../../utils";
import Link from "../links/Link";


export default class Node {
  graph: Graph;
  id: string;
  title: string;
  type: string;
  weight: number;
  color?: string;
  description?: string;
  fixed?: boolean;
  fx?: number;
  fy?: number;
  saveRadical?: boolean;
  url?: string;
  x?: number;
  y?: number;

  constructor(graph: Graph, data: NodeData) {
    this.graph = graph;
    this.id = data.id;
    this.title = data.title;
    this.type = data.type;
    this.color = data.color;
    this.description = data.description;
    this.url = data.url;
    this.x = data.x;
    this.y = data.y;
    this.saveRadical = false;
    this.weight = 0;
  }

  renderNode(gNodeRef: any): void {}
  getLinkPosition(link: Link): Point { return null; }
  getCenter(): Point { return null; }

  onClick() {
    console.log('click');
  }

  onRightClick(n: Node, i: number, nodes) {
    this.graph.contextMenu.openMenu(n, i);
  }
}

/**
 * Retrieve color of given node, return custom color if given, otherwise return
 * type or default color.
 * @param node Data of node to get color of
 */
export function getNodeColor(node: Node) {
  const nodeColor = node.color,
        nodeType = node.type;
  if (nodeColor && nodeColor != '') return color(nodeColor).toString();
  else if (nodeType && nodeType != '') return color(TYPES_TO_COLORS[nodeType]);
  else return color('#545454').toString();
}

/**
 * Set color of given node (and all components).
 * @param node Node to color
 * @param nodeColor Color to set
 */
export function setNodeColor(node, nodeColor?: string) {
  if (!node) return;
  // Use given color if possible, otherwise default to colors specified in node data
  if (nodeColor && nodeColor != '') {
    nodeColor = colorToHex(nodeColor);
  } else {
    const nodeData = getDataFromSelection.bind(this)(node)[0];
    nodeColor = getNodeColor.bind(this)(nodeData);
  }
  
  // Color node using given color and background color
  node.select('.node-body')
      .style('stroke', nodeColor)
      .style('fill', nodeColor);

  node.select('.node-glyph-top')
      .style('stroke', nodeColor)
      .style('fill', '#fafafa');

  node.select('.node-glyph-top-text')
      .style('stroke', nodeColor)
      .style('fill', nodeColor);
    
  node.select('.node-icon')
      .style('stroke', nodeColor)
      .style('fill', '#fafafa');
}

/**
 * Wrap long node labels. printFull states => abbrev, full, none
 * @param textSelection Element that will contain the tspans
 * @param printFull Whether to abbreviate text, display full text, or hide text
 * @param width Max width of text
 */
export function wrapNodeText(textSelection, printFull, width=100) {
  if (printFull != 'abbrev' && printFull != 'full') return;
  const LINE_HEIGHT = 17;
  textSelection.each(function (d) {
    const text = select(this);
    const tokens = text.text().split(' ');
    text.text(null);

    let line = [];
    let remainder;
    let lineNum = 0;
    const dy = parseInt(text.attr('dy'), 10);
    const appendTspan = () => {
      return text.append('tspan')
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
        remainder = (line.length > 1) ? line.pop() : null;
        tspan.text(line.join(' '));
        tspan = appendTspan();
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
