import { brush } from "d3-brush";
import { event, select, Selection } from 'd3-selection';
import { zoomTransform } from 'd3-zoom';
import Graph from "../../Graph";
import NodeClass from "../enums/NodeClass";
import { classNodes } from "../state/select";

export default class Brush {
  graph: Graph;
  brushContainer: Selection<SVGGElement, unknown, HTMLElement, any>;
  brush;
  isBrushing: boolean;
  gBrush: Selection<SVGGElement, unknown, HTMLElement, any>;
  gLasso: Selection<SVGGElement, unknown, HTMLElement, any>;

  constructor(graph: Graph) {
    this.graph = graph;
    this.isBrushing = false;
    this.initBrush();
  }

  private initBrush() {
    this.brushContainer = this.graph.svg.append('g')
      .attr('class', 'brush-container');
  
    this.brush = brush()
      .on('start', () => { this.brushstart(); })
      .on('brush', () => { this.brushing(); })
      .on('end', () => { this.brushend(); });
    this.brush.keyModifiers(false);
  
    select('body')
      .on('keydown.brush', () => { this.keydownBrush(); })
      .on('keyup.brush', () => { this.keyupBrush(); });
  }

  private brushstart() {
    classNodes(this.graph, this.graph.node, NodeClass.Selected, false);
    this.isBrushing = true;
  }

  private brushing() {
    const extent = event.selection;
    this.graph.node
      .classed('possible', (d) => {
        const center = d.getCenter(),
              transform = zoomTransform(this.graph.svg.node()),
              x = center.x * transform.k + transform.x,
              y = center.y * transform.k + transform.y;
        return d.possible = (extent[0][0] <= x && x <= extent[1][0]
                          && extent[0][1] <= y && y <= extent[1][1]);
      });
  
    const possibleNodes = this.graph.node.filter(n => n.possible);
    classNodes(this.graph, possibleNodes, NodeClass.Possible, true);
  }

  private brushend() {
    this.isBrushing = false;
    this.removeBrush();
  
    // Reset possible nodes and select those nodes
    const possibleNodes = this.graph.node.filter('.possible');
    classNodes(this.graph, possibleNodes, NodeClass.Possible, false);
    classNodes(this.graph, possibleNodes, NodeClass.Selected, true);
  }

  private keydownBrush() {
    // Track if modifier is pressed
    this.graph.isModifierPressed = event 
      && (event.shiftKey || event.ctrlKey || event.metaKey); 
  
    // Only draw extent if shift drag or box select button is pressed
    if (this.graph.isModifierPressed) this.addBrush();
  }

  private keyupBrush() {
    // Modifier is no longer pressed
    this.graph.isModifierPressed = false;
    
    // Remove brush (zoom/pan functionality restored automatically)
    this.removeBrush();
  }

  private addBrush() {
    if (this.gBrush || this.gLasso) return;
    this.gBrush = this.brushContainer.append('g')
      .attr('class', 'brush');
    this.gBrush.call(this.brush);
  }

  private removeBrush() {
    if (!this.gBrush || this.isBrushing) return;
    this.gBrush.remove();
    this.gBrush = null;
  }
}
