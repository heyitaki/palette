import { drag } from 'd3-drag';
import { event, select } from 'd3-selection';
import { ALPHA_TARGET_DRAG, VELOCITY_DECAY_DRAG, ALPHA_TARGET, VELOCITY_DECAY_COOL, VELOCITY_DECAY } from '../constants/graph';
import { hideContextMenu } from '../menu';

let activeEvent = false;
let dragTimer = null;

export function initDrag() {
  const self = this;
  this.drag = drag()
    .on('start', function (d) { dragstart.bind(self)(d, this); })
    .on('drag', function (d) { dragging.bind(self)(d, this); })
    .on('end', function (d) { dragend.bind(self)(d, this); });
}

export function dragstart(d, self) {
  hideContextMenu.bind(this)(); 

  // We don't want to restart force layout in dragging if there is already a drag action occuring
  // Must save this value here, because event.active is always true in dragging
  activeEvent = event.active;

  // Track start of drag action
  this.isDragging = true;

  // Set position of dragged node
  // Fix here so that if we click and hold on node it doesn't drift away from cursor
  // Unfixed in dragend if this is a click action, not drag (via dragDistance)
  d.fx = d.x = event.x;
  d.fy = d.y = event.y;
  d.dragDistance = 0;

  // Remove all link text during drag for rendering optimization
  // aesthetics.removeLinkText.bind(this)();
  
  // Freeze graph temporarily to disallow graph jiggling on click
  this.force.stop();
}

export function dragging(d, self) {
  const dragTolerance = 3;

  // Allow some tolerance to mousedown action to disallow graph jiggling on click
  if (!activeEvent && d.dragDistance === dragTolerance) {
    this.force
      .alphaTarget(ALPHA_TARGET_DRAG)
      .velocityDecay(VELOCITY_DECAY_DRAG)
      .restart();
  }

  // Everytime we move the current node, we should reset the time it takes for the force layout to converge
  window.clearTimeout(dragTimer);
  dragTimer = setTimeout(() => { 
    this.force
      .alphaTarget(ALPHA_TARGET)
      .velocityDecay(VELOCITY_DECAY_COOL); 
    d.dragDistance = dragTolerance;
  }, 150);

  // Update node positions if tolerance is exceeded
  // Without this, quickly executed drags will update d.x and d.y without showing visual change
  if (d.dragDistance > dragTolerance) {
    if (d.selected && this.isModifierPressed) {
      // Drag all selected nodes together
      this.node.filter((dx) => { return dx.selected; })
        .each((dx) => { 
          dx.fx = dx.x += event.dx;
          dx.fy = dx.y += event.dy;
        })
        .classed('fixed', (dx) => { return dx.fixed = true; });
    } else {
      // Drag current node only
      d.fx = d.x = event.x;
      d.fy = d.y = event.y;
    }
  }

  d.dragDistance++;
}

export function dragend(d, self) {
  // Allow graph to cool with normal velocityDecay
  window.clearTimeout(dragTimer);
  if (!event.active) {
    this.force
      .alphaTarget(ALPHA_TARGET)
      .velocityDecay(VELOCITY_DECAY);
  }
  
  this.isDragging = false;

  // If dragDistance > 0, this is a drag action, not a click, so we should fix node
  // Otherwise, unfix node (fixed in dragstart)
  if (d.fixed || d.dragDistance) select(self).classed('fixed', d.fixed = true);
  else d.fx = d.fy = null;
}
