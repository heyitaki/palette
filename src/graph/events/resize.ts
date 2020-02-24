import { getCurrentScale } from "./zoom";

/**
 * Handle window resizing.
 * @param graphContainerId id of html element wrapping graph svg
 */
export function handleResize(graphContainerId: string) {
  updateGraphDimensions.bind(this)(graphContainerId);
  window.addEventListener('resize', resized.bind(this, graphContainerId));
}

/**
 * Update all properties dependent on svg width/height. Trigger resized with 
 * 50ms delay to ensure it occurs after a window maximize input.
 * TODO: Find out if we can avoid 50ms delay when window isnt maximized
 * @param graphContainerId id of html element wrapping graph svg
 */
export function resized(graphContainerId: string) {
  const self = this;
  setTimeout(function() {
    self.contextMenu.closeMenu();
    updateGraphDimensions.bind(self)(graphContainerId);
  }, 50);
}

/**
 * Update all properties dependent on svg width/height.
 * @param graphContainerId id of html element wrapping graph svg
 */
export function updateGraphDimensions(graphContainerId: string) {
  const graphContainer = document.getElementById(graphContainerId);
  this.width = graphContainer.clientWidth;
  this.height = graphContainer.clientHeight;
  this.grid.updateGrid(getCurrentScale.bind(this)());
}
