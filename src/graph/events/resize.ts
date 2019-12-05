import { GRID_SQUARE_WIDTH, ZOOM_MIN_SCALE } from "../constants/graph";
import { hideContextMenu } from "../components/menu";

/**
 * Handle window resizing.
 * @param graphContainerId id of html element wrapping graph svg
 */
export function handleResize(graphContainerId: string) {
  updateDimensions.bind(this)(graphContainerId);
  window.addEventListener('resize', resized.bind(this, graphContainerId));
}

/**
 * Update all properties dependent on svg width/height. Trigger resized with 
 * 50ms delay to ensure it occurs after a window maximize input.
 * @param graphContainerId id of html element wrapping graph svg
 */
export function resized(graphContainerId: string) {
  const self = this;
  setTimeout(function() {
    hideContextMenu.bind(self)();
    updateDimensions.bind(self)(graphContainerId);
  }, 50);
}

/**
 * Update all properties dependent on svg width/height.
 * @param graphContainerId id of html element wrapping graph svg
 */
export function updateDimensions(graphContainerId: string) {

  const graphContainer = document.getElementById(graphContainerId);
  this.width = graphContainer.clientWidth;
  this.height = graphContainer.clientHeight;
  this.numTicks = this.width / GRID_SQUARE_WIDTH / ZOOM_MIN_SCALE;
}
