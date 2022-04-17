import { easeLinear } from 'd3-ease';
import { event } from 'd3-selection';
import { zoom, ZoomBehavior, zoomIdentity, zoomTransform, ZoomTransform } from 'd3-zoom';
import Node from '../components/nodes/Node';
import Graph from '../Graph';
import Point from '../Point';

/**
 *
 */
export default class Zoom {
  graph: Graph;
  isZooming: boolean;
  isZoomPressed: boolean;
  zoom: ZoomBehavior<Element, unknown>;

  constructor(graph) {
    this.graph = graph;
    this.isZooming = false;
    this.isZoomPressed = false;
    this.zoom = zoom()
      // .scaleExtent([ZOOM_MIN_SCALE, ZOOM_MAX_SCALE])
      .on('start', () => this.onZoomStart())
      .on('zoom', () => this.onZoom())
      .on('end', () => this.onZoomEnd());
    this.graph.canvas.call(this.zoom);
  }

  public getTransform(): ZoomTransform {
    return zoomTransform(this.graph.canvas.node());
  }

  public translateGraphAroundNode(
    n: Node,
    duration: number = 250,
    delay: number = 0,
    callback = null,
  ) {
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
    const currScale = this.getTransform().k;
    const newX = center[0] - x * currScale;
    const newY = center[1] - y * currScale;
    const newTransform = zoomIdentity.translate(newX, newY).scale(currScale);

    // Transition to the new view over duration ms
    this.interpolateZoom(newTransform, duration, delay, callback);
  }

  private onZoomStart() {
    this.isZooming = true;
    this.graph.contextMenu.closeMenu();
  }

  private onZoom() {
    // Apply transform to grid
    const et = event.transform;
    this.graph.grid.updateGrid();
    this.graph.grid.transformGrid();

    // Apply transform to all other elements
    this.graph.container.attr('transform', et);
  }

  private onZoomEnd() {
    this.isZooming = false;
  }

  /**
   * Smoothly zoom between two views based on given transform for duration ms.
   * @param transform
   * @param duration
   * @param delay
   * @param callback
   */
  private interpolateZoom(
    transform: ZoomTransform,
    duration: number,
    delay: number = 0,
    callback?: Function,
  ) {
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

  /**
   * Zoom in or out by a fixed factor around the center of the graph. This method is currently
   * unused, but will be used for button-based zooming.
   * @param zoomIn Direction of zoom (true = zoom in, false = zoom out)
   */
  private zoomByFixedScale(zoomIn: boolean): void {
    const factor = 4 / 3;
    const center = [this.graph.width / 2, this.graph.height / 2];
    const startTransform = zoomTransform(this.graph.canvas.node());
    const extent = this.zoom.scaleExtent();

    // Create object containing attributes of new view because using zoomIdentity here modifies
    // the current zoomTransform too
    const view = {
      x: startTransform.x,
      y: startTransform.y,
      k: startTransform.k,
    };

    // Ensure scale is within bounds
    let newScale = view.k * (zoomIn ? factor : 1 / factor);
    newScale = Math.max(newScale, extent[0]);
    newScale = Math.min(newScale, extent[1]);

    // If scale doesn't change, no transition is necessary
    if (startTransform.k === newScale) return;

    // Calculate new view
    const translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    const translate1 = [translate0[0] * newScale + view.x, translate0[1] * newScale + view.y];
    view.k = newScale;
    view.x += center[0] - translate1[0];
    view.y += center[1] - translate1[1];

    // Create the transform that defines the zoom transition
    const newTransform = zoomIdentity.translate(view.x, view.y).scale(view.k);

    // If zoom button is still pressed, keep zooming
    const callback = () => {
      if (this.isZoomPressed) this.zoomByFixedScale(zoomIn);
      else this.isZooming = false;
    };

    // Transition to the new view
    this.interpolateZoom(newTransform, 150, 0, callback);
  }
}
