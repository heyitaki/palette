import {brush} from "d3-brush";
import {event, select} from 'd3-selection';
import {zoomTransform} from 'd3-zoom';

export function initBrush() {
  const self = this;

  this.brushContainer = this.svg.append('g')
    .attr('class', 'brush-container');

  this.brush = brush()
    .extent([[0,0], [this.width, this.height]])
    .on('start', function (d) { brushstart.bind(self)(d, this); })
    .on('brush', function (d) { brushing.bind(self)(d, this); })
    .on('end', function (d) { brushend.bind(self)(d, this); });

  select('body')
    .on('keydown.brush', keydownBrush.bind(this))
    .on('keyup.brush', keyupBrush.bind(this));
}

export function brushstart() {
  if (this.freeSelect) return;
  // aesthetics.resetObjectHighlighting.bind(this)();
  this.isBrushing = true;
}

export function brushing() {
  if (this.freeSelect) return;
  const extent = event.selection;
  this.node
    .classed('possible', (d) => {
      const transform = zoomTransform(this.svg.node());
      const x = d.x * transform.k + transform.x;
      const y = d.y * transform.k + transform.y;
      return d.possible = (extent[0][0] <= x && x <= extent[1][0]
                        && extent[0][1] <= y && y <= extent[1][1]);
    });

  // aesthetics.highlightPossibleLinksFromAllNodes.bind(this)();
}

export function brushend() {
  this.isBrushing = false;
  if (this.freeSelect) return;
  // Remove brush and switch back to pointer tool
  removeBrush.bind(this)();
  // actions.selectPointerTool.bind(this)();

  // Reset .possible class on all graph objects
  const toSelect = this.node.filter('.possible');
  this.node.classed('possible', (d) => { return d.possible = false; });
  this.link.classed('possible', (l) => { return l.possible = false; });
  // aesthetics.highlightNodes.bind(this)(toSelect, true);
}
  
export function keydownBrush() {
  // Track if modifier is pressed
  this.isModifierPressed = event && (event.shiftKey || event.ctrlKey || event.metaKey); 

  // Only draw extent if shift drag or box select button is pressed
  if (!this.freeSelect && (this.isModifierPressed || this.rectSelect)) addBrush.bind(this)();
}

export function keyupBrush() {
  // Modifier is no longer pressed
  this.isModifierPressed = false;

  // Don't remove brush if box select button is pressed
  if (this.rectSelect) return;
  
  // Else, remove brush (zoom/pan functionality restored automatically)
  removeBrush.bind(this)();
}

export function addBrush() {
  if (this.gBrush || this.gLasso) return;
  this.gBrush = this.brushContainer.append('g')
    .attr('class', 'brush');
  this.gBrush.call(this.brush);
}

export function removeBrush() {
  if (!this.gBrush || this.isBrushing) return;
  this.gBrush.remove();
  this.gBrush = null;
}
