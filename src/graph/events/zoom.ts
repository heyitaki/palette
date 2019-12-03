import {easeLinear} from 'd3-ease';
import {event} from 'd3-selection';
import {zoom, zoomIdentity, zoomTransform} from 'd3-zoom';
import * as constants from '../constants/graph';

export function initZoom() {
  const self = this;
  this.zoom = zoom()
    .scaleExtent([constants.ZOOM_MIN_SCALE, constants.ZOOM_MAX_SCALE])
    .on('start', function (d) { zoomstart.bind(self)(d, this); })
    .on('zoom', function (d) { zooming.bind(self)(d, this); })
    .on('end', function (d) { zoomend.bind(self)(d, this); });
  addZoom.bind(this)();
}

export function zoomstart(d, self) {
  this.isZooming = true;
  // menu.hideContextMenu.bind(this)();
}

export function zooming(d, self) {
  const et = event.transform;

  // Apply two transforms to grid lines simultaneously:
  // 1. Reverse transform to keep lines fixed while other objects in container are transformed
  // 2. Use mod operator to reuse lines while panning to give illusion of infinite grid
  if (this.showGridLines) {
    const transform = 'translate(' + (((et.x / et.k) % constants.GRID_SQUARE_WIDTH) - et.x / et.k) + ',' 
      + (((et.y / et.k) % constants.GRID_SQUARE_WIDTH) - et.y / et.k) + ')scale(' + 1 + ')';
    this.svgGrid.attr('transform', transform);
  }

  // Apply transform to all other events
  this.container.attr('transform', et);
}

export function zoomend(d, self) {
  this.isZooming = false;
}

// Smoothly zoom between two views based on given transform for duration ms
export function interpolateZoom(transform, duration, delay=0, callback=null) {
  this.isZooming = true;
  this.svg.transition()
    .delay(delay)
    .duration(duration)
    .ease(easeLinear)
    .call(this.zoom.transform, transform)
    .on('end', () => {
      if (callback) callback();
      else this.isZooming = false;
    });
}

// Zoom in or out by a fixed factor, around the center of the graph
export function zoomByFixedScale(zoomIn) {
  const self = this,
    factor = 4/3,
    center = [this.width/2, this.height/2],
    startTransform = zoomTransform(this.svg.node()),
    extent = this.zoom.scaleExtent();

  // Create object containing attributes of new view
  // Using zoomIdentity here modifies the current zoomTransform too
  const view = {x: startTransform.x, y: startTransform.y, k: startTransform.k};
  
  // If new scale is not inbounds, limit to scaleExtent bounds
  // If scale doesn't change, no transition is necessary
  let newScale = view.k * (zoomIn ? factor : 1/factor);
  newScale = Math.max(newScale, extent[0]);
  newScale = Math.min(newScale, extent[1]);
  if (startTransform.k === newScale) return;

  // Calculate new view
  const translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
  const translate1 = [translate0[0] * newScale + view.x, translate0[1] * newScale + view.y];
  view.k = newScale;
  view.x += center[0] - translate1[0];
  view.y += center[1] - translate1[1];

  const newTransform = zoomIdentity
    .translate(view.x, view.y)
    .scale(view.k);

  // If zoom button is still pressed, keep zooming
  const callback = function() {
    if (self.isZoomPressed) zoomByFixedScale.bind(self)(zoomIn);
    else self.isZooming = false;
  }

  // Transition to the new view over 150ms
  interpolateZoom.bind(this)(newTransform, 150, 0, callback);
}

export function addZoom() {
  this.svg.call(this.zoom);
}

export function removeZoom() {
  this.svg
    .on('dblclick.zoom', null)
    .on('mousedown.zoom', null)
    .on('touchstart.zoom', null)
    .on('touchmove.zoom', null)
    .on('touchend.zoom', null);
}

export function translateGraphAroundPoint(x, y, duration=0, delay=0, callback=null) {
  // Calculate view centered on given node
  const startTransform = zoomTransform(this.svg.node());
  const newX = this.center[0] - x * startTransform.k;
  const newY = this.center[1] - y * startTransform.k;
  const newTransform = zoomIdentity
    .translate(newX, newY)
    .scale(startTransform.k);

  // Transition to the new view over duration ms
  interpolateZoom.bind(this)(newTransform, duration, delay, callback);
}

export function translateGraphAroundNode(d, duration=250, delay=0, callback=null) {
  translateGraphAroundPoint.bind(this)(d.x, d.y, duration, delay, callback);
}

export function translateGraphAroundId(id, duration=250, delay=0, callback=null) {
  // const nodeData = selection.getDataFromId.bind(this)(id);
  // translateGraphAroundNode.bind(this)(nodeData, duration, delay, callback);
}
