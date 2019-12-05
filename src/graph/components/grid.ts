import { range } from "d3-array";
import { GRID_SQUARE_WIDTH, ZOOM_MIN_SCALE } from "../constants/graph";

let showGridLines = true;

export function initGrid() {
  if (!showGridLines) return;

  this.svgGrid = this.container.append('g')
    .attr('class', 'svg-grid');

  this.svgGrid
    .append('g')
    .attr('class', 'grid-x')
    .selectAll('line')
    .data(range(0, (this.numTicks + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH))
    .enter().append('line')
      .attr('x1', (d) => { return d; })
      .attr('y1', (d) => { return -1 * GRID_SQUARE_WIDTH; })
      .attr('x2', (d) => { return d; })
      .attr('y2', (d) => { return (1 / ZOOM_MIN_SCALE) * this.height + GRID_SQUARE_WIDTH; });

  this.svgGrid
    .append('g')
    .attr('class', 'grid-y')
    .selectAll('line')
    .data(range(0, (this.numTicks + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH))
    .enter().append('line')
      .attr('x1', (d) => { return -1 * GRID_SQUARE_WIDTH; })
      .attr('y1', (d) => { return d; })
      .attr('x2', (d) => { return (1 / ZOOM_MIN_SCALE) * this.width + GRID_SQUARE_WIDTH; })
      .attr('y2', (d) => { return d; });
}

export function transformGrid(et) {
  // Apply two transforms to grid lines simultaneously:
  // 1. Reverse transform to keep lines fixed while other objects in container are transformed
  // 2. Use mod operator to reuse lines while panning to give illusion of infinite grid
  if (showGridLines) {
    const transform = 'translate(' + (((et.x / et.k) % GRID_SQUARE_WIDTH) - et.x / et.k) + ',' 
      + (((et.y / et.k) % GRID_SQUARE_WIDTH) - et.y / et.k) + ')scale(' + 1 + ')';
    this.svgGrid.attr('transform', transform);
  }
}
