import { range } from 'd3-array';
import { Selection } from 'd3-selection';
import { ZoomTransform } from 'd3-zoom';
import { GRID_SQUARE_WIDTH, ZOOM_SCALE_INTIAL } from '../constants/graph';
import Graph from '../Graph';

export default class Grid {
  grid: Selection<SVGGElement, unknown, HTMLElement, any>;
  gridX: Selection<SVGGElement, unknown, HTMLElement, any>;
  gridY: Selection<SVGGElement, unknown, HTMLElement, any>;
  graph: Graph;
  numSquaresX: number;
  numSquaresY: number;
  showGridLines: boolean;

  constructor(graph: Graph, showGridLines = true) {
    this.graph = graph;
    this.showGridLines = showGridLines;
    this.displayGrid(showGridLines);
  }

  displayGrid(showGridLines: boolean): void {
    this.showGridLines = showGridLines;
    if (showGridLines) {
      this.grid = this.graph.container.append('g').lower().attr('class', 'grid');
      this.gridX = this.grid.append('g').attr('class', 'grid-x');
      this.gridY = this.grid.append('g').attr('class', 'grid-y');
      this.updateGrid();
      this.transformGrid();
    } else if (!showGridLines) {
      this.grid?.remove();
      this.numSquaresX = null;
      this.numSquaresY = null;
    }
  }

  transformGrid(): void {
    // Apply two transforms to grid lines simultaneously:
    // 1. Reverse transform to keep lines fixed while other objects in container are transformed
    // 2. Use mod operator to reuse lines while panning to give illusion of infinite grid
    if (this.showGridLines) {
      const event = this.graph.zoom?.getTransform() || ({ k: 1, x: 0, y: 0 } as ZoomTransform);
      const transform =
        'translate(' +
        (((event.x / event.k) % GRID_SQUARE_WIDTH) - event.x / event.k) +
        ',' +
        (((event.y / event.k) % GRID_SQUARE_WIDTH) - event.y / event.k) +
        ')' +
        'scale(1)';
      this.grid.attr('transform', transform);
    }
  }

  updateGrid(): void {
    if (this.showGridLines) {
      const currScale = this.graph.zoom?.getScale() || ZOOM_SCALE_INTIAL;
      const prevNumSquaresX = this.numSquaresX || 0;
      this.numSquaresX = this.graph.width / GRID_SQUARE_WIDTH / currScale;
      this.numSquaresY = this.graph.height / GRID_SQUARE_WIDTH / currScale;

      // Don't update grid if scale hasn't changed
      if (this.numSquaresX === prevNumSquaresX) return;

      // Add new horizontal lines, update width of all lines, remove unnecessary lines
      const xLines = this.gridX
        .selectAll('line')
        .data(range(0, (this.numSquaresY + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH));
      const xEnter = xLines
        .enter()
        .append('line')
        .attr('x1', -1 * GRID_SQUARE_WIDTH)
        .attr('y1', (d) => d)
        .attr('y2', (d) => d);
      xLines.merge(xEnter).attr('x2', this.graph.width / currScale + GRID_SQUARE_WIDTH);
      xLines.exit().remove();

      // Add new vertical lines, update height of all lines, remove unnecessary lines
      const yLines = this.gridY
        .selectAll('line')
        .data(range(0, (this.numSquaresX + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH));
      const yEnter = yLines
        .enter()
        .append('line')
        .attr('x1', (d) => d)
        .attr('y1', -1 * GRID_SQUARE_WIDTH)
        .attr('x2', (d) => d);
      yLines.merge(yEnter).attr('y2', this.graph.height / currScale + GRID_SQUARE_WIDTH);
      yLines.exit().remove();
    }
  }
}
