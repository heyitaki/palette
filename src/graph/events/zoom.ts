import { max, min } from 'd3-array';
import { easeLinear } from 'd3-ease';
import { event } from 'd3-selection';
import { zoom, ZoomBehavior, zoomIdentity, zoomTransform, ZoomTransform } from 'd3-zoom';
import Node from '../components/nodes/Node';
import Graph from '../Graph';
import Point from '../Point';

export default class Zoom {
  graph: Graph;
  zoom: ZoomBehavior<Element, unknown>;

  constructor(graph) {
    this.graph = graph;
    this.zoom = zoom()
      // .scaleExtent([ZOOM_MIN_SCALE, ZOOM_MAX_SCALE])
      .on('start', () => this.onZoomStart())
      .on('zoom', () => this.onZoom())
      .on('end', () => this.onZoomEnd());
    this.graph.refs.canvasContainer.call(this.zoom);
  }

  public getTransform(): ZoomTransform {
    return zoomTransform(this.graph.refs.canvasContainer.node());
  }

  public translateGraphAroundNode(
    n: Node,
    duration: number = 250,
    delay: number = 0,
  ): Promise<void> {
    return this.translateGraphAroundPoint(n.getCenter(), duration, delay);
  }

  public translateGraphAroundPoint(
    point: Point,
    duration: number = 0,
    delay: number = 0,
  ): Promise<void> {
    // Calculate view centered on given node
    const center = new Point(this.graph.width / 2, this.graph.height / 2);
    const currScale = this.getTransform().k;
    const newX = center.x - point.x * currScale;
    const newY = center.y - point.y * currScale;
    const newTransform = zoomIdentity.translate(newX, newY).scale(currScale);

    // Transition to the new view over duration ms
    return this.interpolateZoom(newTransform, duration, delay);
  }

  /**
   * Center graph on nodes in `n1` while making sure all nodes in `n2` are visible, scaling the
   * graph out if necessary.
   *
   * TODO: Frame the nodes in `n2` in the viewport
   * @param n1 Nodes to center on
   * @param n2 Nodes to keep visible
   * @returns Promise that resolves when the zoom transition is complete
   */
  public scaleGraphAroundNodes(n1: Node[], n2?: Node[]): Promise<void> {
    if (!n2) n2 = n1;

    // Compute center of nodes
    let sumX = 0;
    let sumY = 0;
    n1.forEach((n) => {
      sumX += n.x;
      sumY += n.y;
    });
    const center = new Point(sumX / n1.length, sumY / n1.length);

    // Make sure all nodes are in frame
    // This code is currently unused.
    let minX: number;
    let minY: number;
    let maxX: number;
    let maxY: number;
    n2.forEach((n) => {
      minX = min([minX, n.x]);
      minY = min([minY, n.y]);
      maxX = max([maxX, n.x]);
      maxY = max([maxY, n.y]);
    });

    return this.translateGraphAroundPoint(center, 150, 0);
  }

  /**
   * Zoom in or out by a fixed factor or zoom to a specific scale level, if given. Zoom is centered
   * on a specified point or the center of the graph if no point is provided.
   * @param zoomIn Direction of zoom (true = zoom in, false = zoom out)
   */
  public scaleGraphAroundPoint(opts: ZoomOpts = {}): Promise<void> {
    // Use default options if none are provided
    const defaultOpts: ZoomOpts = {
      factor: 4 / 3,
      center: new Point(this.graph.width / 2, this.graph.height / 2),
      zoomIn: true,
    };
    opts = Object.assign({}, defaultOpts, opts);

    // Get current transform
    const startTransform = zoomTransform(this.graph.refs.canvasContainer.node());

    // Create object containing attributes of new view because using zoomIdentity here modifies
    // the current zoomTransform too
    const view = {
      x: startTransform.x,
      y: startTransform.y,
      k: startTransform.k,
    };

    // Ensure scale is within bounds
    const extent = this.zoom.scaleExtent();
    let newScale = opts.scale || view.k * (opts.zoomIn ? opts.factor : 1 / opts.factor);
    newScale = Math.max(newScale, extent[0]);
    newScale = Math.min(newScale, extent[1]);

    // If scale doesn't change, no transition is necessary
    if (startTransform.k === newScale) return;

    // Calculate new view
    const absPos = new Point((opts.center.x - view.x) / view.k, (opts.center.y - view.y) / view.k);
    const newPos = new Point(absPos.x * newScale + view.x, absPos.y * newScale + view.y);
    view.k = newScale;
    view.x += opts.center.x - newPos.x;
    view.y += opts.center.y - newPos.y;

    // Create the transform that defines the zoom transition
    const newTransform = zoomIdentity.translate(view.x, view.y).scale(view.k);

    // Transition to the new view
    return this.interpolateZoom(newTransform, 150, 0);
  }

  private onZoomStart() {
    this.graph.contextMenu.closeMenu();
  }

  private onZoom() {
    // Apply transform to grid
    const et = event.transform;
    this.graph.grid.updateGrid();
    this.graph.grid.transformGrid();

    // Apply transform to all other elements
    this.graph.refs.graphContainer.attr('transform', et);
  }

  private onZoomEnd() {}

  /**
   * Smoothly zoom between two views based on given transform for duration ms.
   * @param transform
   * @param duration
   * @param delay
   */
  private interpolateZoom(
    transform: ZoomTransform,
    duration: number,
    delay: number = 0,
  ): Promise<void> {
    return this.graph.refs.canvasContainer
      .transition()
      .delay(delay)
      .duration(duration)
      .ease(easeLinear)
      .call(this.zoom.transform, transform)
      .end();
  }
}

interface ZoomOpts {
  factor?: number;
  scale?: number;
  center?: Point;
  zoomIn?: boolean;
}
