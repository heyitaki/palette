import { easeLinear } from 'd3-ease';
import { event } from 'd3-selection';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import Node from '../components/nodes/Node';
import { ZOOM_MAX_SCALE, ZOOM_MIN_SCALE } from '../constants/graph';
import Graph from '../Graph';
import Point from '../Point';

export default class Zoom {
  graph: Graph;
  isZooming: boolean;
  isZoomPressed: boolean;
  zoom;

  constructor(graph) {
    this.graph = graph;
    this.isZooming = false;
    this.isZoomPressed = false;
    this.initZoom();
  }

  public getCurrentScale() {
    return zoomTransform(this.graph.canvas.node()).k;
  }

  public translateGraphAroundNode(
    n: Node,
    duration: number = 250,
    delay: number = 0,
    callback = null,
  ) {
    console.log(n);
    const center: Point = n.getCenter();
    this.translateGraphAroundPoint(center.x, center.y, duration, delay, callback);
  }

  public translateGraphAroundPoint(
    x: number,
    y: number,
    duration: number = 0,
    delay: number = 0,
    callback = null,
  ) {
    // Calculate view centered on given node
    const center = [this.graph.width / 2, this.graph.height / 2];
    const currScale = this.getCurrentScale();
    const newX = center[0] - x * currScale;
    const newY = center[1] - y * currScale;
    const newTransform = zoomIdentity.translate(newX, newY).scale(currScale);

    // Transition to the new view over duration ms
    this.interpolateZoom(newTransform, duration, delay, callback);
  }

  private initZoom() {
    this.zoom = zoom()
      .scaleExtent([ZOOM_MIN_SCALE, ZOOM_MAX_SCALE])
      .on('start', () => this.onZoomStart())
      .on('zoom', () => this.onZoom())
      .on('end', () => this.onZoomEnd());
    this.addZoom();
  }

  private onZoomStart() {
    this.isZooming = true;
    this.graph.contextMenu.closeMenu();
  }

  private onZoom() {
    // Apply transform to grid
    const et = event.transform;
    this.graph.grid.updateGrid(this.getCurrentScale());
    this.graph.grid.transformGrid(et);

    // Apply transform to all other elements
    this.graph.container.attr('transform', et);
  }

  private onZoomEnd() {
    this.isZooming = false;
  }

  // Smoothly zoom between two views based on given transform for duration ms
  private interpolateZoom(transform, duration, delay = 0, callback = null) {
    this.isZooming = true;
    this.graph.canvas
      .transition()
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
  private zoomByFixedScale(zoomIn: boolean) {
    const factor = 4 / 3,
      center = [this.graph.width / 2, this.graph.height / 2],
      startTransform = zoomTransform(this.graph.canvas.node()),
      extent = this.zoom.scaleExtent();

    // Create object containing attributes of new view
    // Using zoomIdentity here modifies the current zoomTransform too
    const view = {
      x: startTransform.x,
      y: startTransform.y,
      k: startTransform.k,
    };

    // If new scale is not inbounds, limit to scaleExtent bounds
    // If scale doesn't change, no transition is necessary
    let newScale = view.k * (zoomIn ? factor : 1 / factor);
    newScale = Math.max(newScale, extent[0]);
    newScale = Math.min(newScale, extent[1]);
    if (startTransform.k === newScale) return;

    // Calculate new view
    const translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    const translate1 = [translate0[0] * newScale + view.x, translate0[1] * newScale + view.y];
    view.k = newScale;
    view.x += center[0] - translate1[0];
    view.y += center[1] - translate1[1];

    const newTransform = zoomIdentity.translate(view.x, view.y).scale(view.k);

    // If zoom button is still pressed, keep zooming
    const callback = () => {
      if (this.isZoomPressed) this.zoomByFixedScale(zoomIn);
      else this.isZooming = false;
    };

    // Transition to the new view over 150ms
    this.interpolateZoom(newTransform, 150, 0, callback);
  }

  private addZoom() {
    this.graph.canvas.call(this.zoom);
  }

  private removeZoom() {
    this.graph.canvas
      .on('dblclick.zoom', null)
      .on('mousedown.zoom', null)
      .on('touchstart.zoom', null)
      .on('touchmove.zoom', null)
      .on('touchend.zoom', null);
  }
}
