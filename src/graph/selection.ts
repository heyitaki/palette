export function getSelectedNodes() {
  return this.nodeContainer.selectAll('.node.selected');
}

export function getAllNodes() {
  return this.nodeContainer.selectAll('.node');
}

export function getAllLinks() {
  return this.linkContainer.selectAll('.link');
}

/**
 * Get list of data bound to a given selection of nodes
 * @param selection d3 selection of DOM elements
 */
export function getDataFromSelection(selection) {
  if (!selection || selection.empty()) return;
  return selection.nodes().map(x => x.__data__);
}

/**
 * Determine if input is an instance of d3.selection.
 * https://github.com/palantir/plottable/pull/637
 * @param x 
 */
export function isSelection(x) {
  return typeof x[0] !== 'string';
}
