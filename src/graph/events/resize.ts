import Graph from '../Graph';

/**
 * Handle window resizing.
 * @param graphContainerId id of html element wrapping graph svg
 */
export function handleResize(graph: Graph, graphContainerId: string) {
  updateGraphDimensions(graph, graphContainerId);
  window.addEventListener('resize', () => resized(graph, graphContainerId));
}

/**
 * Update all properties dependent on svg width/height. Trigger resized with
 * 50ms delay to ensure it occurs after a window maximize input.
 * TODO: Find out if we can avoid 50ms delay when window isnt maximized
 * @param graphContainerId id of html element wrapping graph svg
 */
function resized(graph: Graph, graphContainerId: string) {
  setTimeout(() => {
    graph.contextMenu.closeMenu();
    updateGraphDimensions(graph, graphContainerId);
  }, 50);
}

/**
 * Update all properties dependent on svg width/height.
 * @param graphContainerId id of html element wrapping graph svg
 */
function updateGraphDimensions(graph: Graph, graphContainerId: string) {
  const graphContainer = document.getElementById(graphContainerId);
  graph.width = graphContainer.clientWidth;
  graph.height = graphContainer.clientHeight;
  graph.grid.updateGrid();
}
