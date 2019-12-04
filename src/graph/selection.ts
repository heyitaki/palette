export function getSelectedNodes() {
  return this.nodeContainer.selectAll('.node.selected');
}

// Get list of data bound to a given selection of nodes
export function getDataFromSelection(selection) {
  if (!selection || selection.empty()) return;
  return selection.nodes().map(x => x.__data__);
}
