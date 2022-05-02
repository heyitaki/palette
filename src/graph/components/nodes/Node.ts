import { event, select } from 'd3-selection';
import NodeData from '../../../server/NodeData';
import { NodeSelection } from '../../../types';
import NodeClass from '../../enums/NodeClass';
import Graph from '../../Graph';
import Point from '../../Point';
import { expandNodes } from '../../state/expand';
import { classNodes } from '../../state/select';
import Link from '../links/Link';

export default class Node {
  graph: Graph;
  id: string;
  title: string;
  type: string;
  weight: number;
  color?: string;
  description?: string;
  dragDistance?: number;
  fixed?: boolean;
  fx?: number; // d3 internals
  fy?: number; // d3 internals
  possible?: boolean;
  selected?: boolean;
  saveRadical?: boolean;
  totalLinks?: number;
  url?: string;
  vx?: number; // d3 internals
  vy?: number; // d3 internals
  x?: number; // d3 internals
  y?: number; // d3 internals

  constructor(data: NodeData, graph: Graph) {
    this.graph = graph;
    this.id = data.id;
    this.title = data.title;
    this.type = data.type;
    this.color = data.color;
    this.description = data.description;
    this.totalLinks = data.totalLinks || 0;
    this.url = data.url;
    this.x = data.x;
    this.y = data.y;
    this.dragDistance = 0;
    this.possible = false;
    this.selected = false;
    this.saveRadical = false;
    this.weight = 0;
  }

  renderNode(gNodeRef: SVGElement): void {
    // Do nothing
  }

  getLinkPosition(link: Link): Point {
    return null;
  }

  getCenter(): Point {
    return null;
  }

  onClick(n: Node, i: number, nodeRef: SVGElement) {
    event.stopPropagation();
    this.graph.contextMenu.closeMenu();

    // Handling single click selection
    const currNode: NodeSelection = select(nodeRef);
    if (!this.graph.isModifierPressed) {
      // Unselect all other nodes, select current node
      classNodes(this.graph, this.graph.refs.nodes, NodeClass.Selected, false);
      classNodes(this.graph, currNode, NodeClass.Selected, true);
    } else {
      // State of other nodes unchanged, toggle selection of current node
      classNodes(this.graph, currNode, NodeClass.Selected, undefined, true);
    }
  }

  onDoubleClick(n: Node, i: number, nodeRef: SVGElement) {
    event.stopPropagation();
    expandNodes(this.graph, select(nodeRef));
  }

  onRightClick(n: Node, i: number, nodeRef: SVGElement) {
    if (!n.selected) {
      const currNode: NodeSelection = select(nodeRef);
      classNodes(this.graph, this.graph.refs.nodes, NodeClass.Selected, false);
      classNodes(this.graph, currNode, NodeClass.Selected, true);
    }

    this.graph.contextMenu.openMenu(n, i);
  }
}
