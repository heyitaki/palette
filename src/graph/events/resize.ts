import { hideContextMenu } from "../components/menu";
import { updateGridDimensions } from "../components/grid";

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
 * @param graphContainerId id of html element wrapping graph svg
 */
export function resized(graphContainerId: string) {
  const self = this;
  setTimeout(function() {
    hideContextMenu.bind(self)();
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
  updateGridDimensions.bind(this)();
}
