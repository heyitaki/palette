import { range } from "d3-array";
import { GRID_SQUARE_WIDTH } from "../constants/graph";
import { getCurrentScale } from "../events/zoom";

let showGridLines = true;

export function initGrid() {
  if (!showGridLines) return;

  const currScale = getCurrentScale.bind(this)();
  this.grid = this.container.append('g')
    .attr('class', 'svg-grid');

  this.gridX = this.grid.append('g')
    .attr('class', 'grid-x');
  
  this.gridX
    .selectAll('line')
    .data(range(0, (this.gridHeight + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH))
    .enter().append('line')
      .attr('x1', (d) => { return -1 * GRID_SQUARE_WIDTH; })
      .attr('y1', (d) => { return d; })
      .attr('x2', (d) => { return this.width / currScale + GRID_SQUARE_WIDTH; })
      .attr('y2', (d) => { return d; });

  this.gridY = this.grid.append('g')
    .attr('class', 'grid-y');

  this.gridY
    .selectAll('line')
    .data(range(0, (this.gridWidth + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH))
    .enter().append('line')
      .attr('x1', (d) => { return d; })
      .attr('y1', (d) => { return -1 * GRID_SQUARE_WIDTH; })
      .attr('x2', (d) => { return d; })
      .attr('y2', (d) => { return this.height / currScale + GRID_SQUARE_WIDTH; });
}

export function transformGrid(et) {
  // Apply two transforms to grid lines simultaneously:
  // 1. Reverse transform to keep lines fixed while other objects in container are transformed
  // 2. Use mod operator to reuse lines while panning to give illusion of infinite grid
  if (showGridLines) {
    const transform = 'translate(' 
      + (((et.x / et.k) % GRID_SQUARE_WIDTH) - et.x / et.k) + ',' 
      + (((et.y / et.k) % GRID_SQUARE_WIDTH) - et.y / et.k) + ')scale(' + 1 + ')';
    this.grid.attr('transform', transform);
  }
}

export function updateGridDimensions() {
  const prevGridWidth = this.gridWidth;
  const currScale = getCurrentScale.bind(this)();
  this.gridWidth = (this.width / GRID_SQUARE_WIDTH) / currScale;
  this.gridHeight = (this.height / GRID_SQUARE_WIDTH) / currScale;

  // Don't update grid if it hasn't been created yet or if scale hasn't changed
  const hasScaleChanged = this.gridWidth != prevGridWidth;
  if (!this.grid || !hasScaleChanged) return;

  // Add new horizontal lines, update width of all lines, remove unnecessary lines
  const xSelection = this.gridX
    .selectAll('line')
    .data(range(0, (this.gridHeight + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH));
  
  const xEnter = xSelection.enter().append('line')
    .attr('x1', -1 * GRID_SQUARE_WIDTH)
    .attr('y1', (d) => { return d; })
    .attr('y2', (d) => { return d; });
  xSelection.merge(xEnter)
    .attr('x2', this.width / currScale + GRID_SQUARE_WIDTH)
  xSelection.exit().remove();

  // Add new vertical lines, update height of all lines, remove unnecessary lines
  const ySelection = this.gridY
    .selectAll('line')
    .data(range(0, (this.gridWidth + 1) * GRID_SQUARE_WIDTH, GRID_SQUARE_WIDTH));

  const yEnter = ySelection.enter().append('line')
    .attr('x1', (d) => { return d; })
    .attr('y1', -1 * GRID_SQUARE_WIDTH)
    .attr('x2', (d) => { return d; });
  ySelection.merge(yEnter)
    .attr('y2', this.height / currScale + GRID_SQUARE_WIDTH);
  ySelection.exit().remove();
}
