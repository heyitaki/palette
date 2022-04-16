import { drag } from 'd3-drag';
import { event, select } from 'd3-selection';
import Node from '../components/nodes/Node';
import {
  ALPHA_TARGET,
  ALPHA_TARGET_DRAG,
  VELOCITY_DECAY,
  VELOCITY_DECAY_COOL,
  VELOCITY_DECAY_DRAG,
} from '../constants/graph';
import Graph from '../Graph';

export default class Drag {
  activeEvent;
  drag;
  dragTimer;
  graph: Graph;
  isDragging: boolean;

  constructor(graph: Graph) {
    this.graph = graph;
    this.activeEvent = false;
    this.dragTimer = null;
    this.isDragging = false;
    this.initDrag();
  }

  public get() {
    return this.drag;
  }

  private initDrag() {
    this.drag = drag<SVGElement, Node>()
      .on('start', (n: Node) => this.onDragStart(n))
      .on('drag', (n: Node) => this.onDrag(n))
      .on('end', (n, i, nodes) => this.onDragEnd(n, i, nodes));
  }

  private onDragStart(n: Node) {
    this.graph.contextMenu.closeMenu();

    // We don't want to restart force layout in dragging if there is already a drag action occuring
    // Must save this value here, because event.active is always true in dragging
    this.activeEvent = event.active;

    // Track start of drag action
    this.isDragging = true;

    // Set position of dragged node
    // Fix here so that if we click and hold on node it doesn't drift away from cursor
    // Unfixed in dragend if this is a click action, not drag (via dragDistance)
    n.fx = n.x = event.x;
    n.fy = n.y = event.y;
    n.dragDistance = 0;

    // Remove all link text during drag for rendering optimization
    // aesthetics.removeLinkText.bind(this)();

    // Freeze graph temporarily to disallow graph jiggling on click
    this.graph.force.stop();
  }

  private onDrag(n: Node) {
    const dragTolerance = 3;

    // Allow some tolerance to mousedown action to disallow graph jiggling on click
    if (!this.activeEvent && n.dragDistance === dragTolerance) {
      this.graph.force.alphaTarget(ALPHA_TARGET_DRAG).velocityDecay(VELOCITY_DECAY_DRAG).restart();
    }

    // Everytime we move the current node, we should reset the time it takes for the force layout to converge
    window.clearTimeout(this.dragTimer);
    this.dragTimer = setTimeout(() => {
      this.graph.force.alphaTarget(ALPHA_TARGET).velocityDecay(VELOCITY_DECAY_COOL);
      n.dragDistance = dragTolerance;
    }, 150);

    // Update node positions if tolerance is exceeded
    // Without this, quickly executed drags will update d.x and d.y without showing visual change
    if (n.dragDistance > dragTolerance) {
      if (n.selected && this.graph.isModifierPressed) {
        // Drag all selected nodes together
        this.graph.nodes
          .filter((dx) => {
            return dx.selected;
          })
          .each((dx) => {
            dx.fx = dx.x += event.dx;
            dx.fy = dx.y += event.dy;
          })
          .classed('fixed', (dx) => {
            return (dx.fixed = true);
          });
      } else {
        // Drag current node only
        n.fx = n.x = event.x;
        n.fy = n.y = event.y;
      }
    }

    n.dragDistance++;
  }

  private onDragEnd(n: Node, i: number, nodes: SVGElement[] | ArrayLike<SVGElement>) {
    // Allow graph to cool with normal velocityDecay
    window.clearTimeout(this.dragTimer);
    if (!event.active) {
      this.graph.force.alphaTarget(ALPHA_TARGET).velocityDecay(VELOCITY_DECAY);
    }

    this.isDragging = false;

    // If dragDistance > 0, this is a drag action, not a click, so we should fix node
    // Otherwise, unfix node (fixed in dragstart)
    if (n.fixed || n.dragDistance) select(nodes[i]).classed('fixed', (n.fixed = true));
    else n.fx = n.fy = null;
  }
}
