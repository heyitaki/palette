import { range } from "d3-array";
import Graph from "../../Graph";
import { GRID_SQUARE_WIDTH } from "../constants/graph";

export default class Grid {
  grid;
  gridX;
  gridY;
  graph: Graph;
  numSquaresX: number;
  numSquaresY: number;
  showGridLines: boolean;

  constructor(graph: Graph, showGridLines=true) {
    this.grid = graph.container.append('g')
      .attr('class', 'grid');
    this.gridX = this.grid.append('g')
      .attr('class', 'grid-x');
    this.gridY = this.grid.append('g')
      .attr('class', 'grid-y');
    this.graph = graph;
    this.showGridLines = showGridLines;
  }

  transformGrid(event): void {
    // Apply two transforms to grid lines simultaneously:
    // 1. Reverse transform to keep lines fixed while other objects in container are transformed
    // 2. Use mod operator to reuse lines while panning to give illusion of infinite grid
    if (this.showGridLines) {
      const transform = 'translate(' 
        + (((event.x / event.k) % GRID_SQUARE_WIDTH) - event.x / event.k) + ',' 
        + (((event.y / event.k) % GRID_SQUARE_WIDTH) - event.y / event.k) + ')'
        + 'scale(1)';
      this.grid.attr('transform', transform);
    }
  }

  updateGrid(currScale: number): void {
    const prevNumSquaresX = this.numSquaresX || 0;
    this.numSquaresX = (this.graph.width / GRID_SQUARE_WIDTH) / currScale;
    this.numSquaresY = (this.graph.height / GRID_SQUARE_WIDTH) / currScale;
  
    // Don't update grid if scale hasn't changed
    if (this.numSquaresX === prevNumSquaresX) return;
  
    // Add new horizontal lines, update width of all lines, remove unnecessary lines
    const xSelection = this.gridX
      .selectAll('line')
      .data(range(0, (this.numSquaresY + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH));
    const xEnter = xSelection.enter().append('line')
      .attr('x1', -1 * GRID_SQUARE_WIDTH)
      .attr('y1', d => d)
      .attr('y2', d => d);
    xSelection.merge(xEnter)
      .attr('x2', this.graph.width / currScale + GRID_SQUARE_WIDTH);
    xSelection.exit().remove();
  
    // Add new vertical lines, update height of all lines, remove unnecessary lines
    const ySelection = this.gridY
      .selectAll('line')
      .data(range(0, (this.numSquaresX + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH));
    const yEnter = ySelection.enter().append('line')
      .attr('x1', d => d)
      .attr('y1', -1 * GRID_SQUARE_WIDTH)
      .attr('x2', d => d);
    ySelection.merge(yEnter)
      .attr('y2', this.graph.height / currScale + GRID_SQUARE_WIDTH);
    ySelection.exit().remove();
  }
}
