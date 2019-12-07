export function getSelectedNodes() {
  return this.nodeContainer.selectAll('.node.selected');
}

export function getAllNodes() {
  return this.nodeContainer.selectAll('.node');
}

export function getAllLinks() {
  return this.linkContainer.selectAll('.link');
}

// Get list of data bound to a given selection of nodes
export function getDataFromSelection(selection) {
  if (!selection || selection.empty()) return;
  return selection.nodes().map(x => x.__data__);
}
