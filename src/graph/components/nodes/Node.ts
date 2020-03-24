import { color } from "d3-color";
import { event, select } from "d3-selection";
import Graph from "../../../Graph";
import NodeData from "../../../server/NodeData";
import { NodeSelection } from "../../../types";
import { TYPES_TO_COLORS } from "../../constants/mappings";
import NodeClass from "../../enums/NodeClass";
import PrintState from "../../enums/PrintState";
import Point from "../../Point";
import { getDataFromSelection } from "../../selection";
import { classNodes } from "../../state/select";
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
  possible?: boolean;
  selected?: boolean;
  saveRadical?: boolean;
  totalLinks?: number;
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
    this.totalLinks = data.totalLinks;
    this.url = data.url;
    this.x = data.x;
    this.y = data.y;
    this.possible = false;
    this.selected = false;
    this.saveRadical = false;
    this.weight = 0;
  }

  renderNode(gNodeRef: SVGElement): void {}
  getLinkPosition(link: Link): Point { return null; }
  getCenter(): Point { return null; }

  clickWrapper(n: Node, i: number, nodeRef: SVGElement): void{
    event.stopImmediatePropagation();
    if (n.id === this.graph.clickedNodeId) {
      // User has clicked twice within certain threshold, treat as double click
      // Remove doubleClickTimer so single click action is not dispatched
      // Do nothing, let d3 execute its own dblclick handler
      this.graph.clickedNodeId = null;
      clearTimeout(this.graph.doubleClickTimer);
    } else {
      // User has clicked once, remove timer in case user has clicked on a new
      // node within doubleclick threshold
      clearTimeout(this.graph.doubleClickTimer);

      // Wait 200ms in case doubleclick, else treat as single click action
      this.graph.clickedNodeId = n.id;
      this.graph.doubleClickTimer = setTimeout(() => {
        this.onClick(n, i, nodeRef);
        this.graph.clickedNodeId = null;
      }, 200);
    }
  }

  onClick(n: Node, i: number, nodeRef: SVGElement) {
    this.graph.contextMenu.closeMenu();

    // Handling single click selection
    const currNode: NodeSelection = select(nodeRef);
    if (!this.graph.isModifierPressed) {
      // Unselect all other nodes, select current node
      classNodes(this.graph, this.graph.node, NodeClass.Selected, false);
      classNodes(this.graph, currNode, NodeClass.Selected, true);
    } else {
      // State of other nodes unchanged, toggle selection of current node
      classNodes(this.graph, currNode, NodeClass.Selected, undefined, true);
    }
  }

  onRightClick(n: Node, i: number, nodes) {
    this.graph.contextMenu.openMenu(n, i);
  }
}

/**
 * Retrieve color of given node, return custom color if given, otherwise return
 * type or default color.
 * @param node Node to get color of
 */
export function getNodeColor(node: Node) {
  const nodeColor = node.color, nodeType = node.type;
  if (nodeColor && nodeColor != '') return color(nodeColor).toString();
  else if (nodeType && TYPES_TO_COLORS[nodeType]) return color(TYPES_TO_COLORS[nodeType]).toString();
  else return color('#545454').toString();
}

/**
 * Set color of given node (and all components).
 * @param node Node to color
 * @param nodeColor Color to set
 */
export function setNodeColor(node: NodeSelection, nodeColor?: string) {
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
 * @param printState Whether to abbreviate text, display full text, or hide text
 * @param width Max width of text
 */
export function wrapNodeText(textSelection, printState: PrintState, 
    width: number=100) {
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

      if (printState === PrintState.Abbreviated && lineNum > 0) {
        break;
      }
    }

    let finalLine = line.join(' ');
    finalLine = (printState === PrintState.Abbreviated && i < tokens.length-1) 
      ? `${finalLine.trim()}...` 
      : finalLine;
    tspan.text(finalLine);
  });
}
