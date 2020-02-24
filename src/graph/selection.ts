import { BaseType, Selection } from 'd3-selection';

export function getSelectedNodes(): 
    Selection<BaseType, unknown, HTMLElement, any> {
  return this.nodeContainer.selectAll('.node.selected');
}

export function getAllNodes(): Selection<BaseType, unknown, HTMLElement, any> {
  return this.nodeContainer.selectAll('.node');
}

export function getAllLinks(): Selection<BaseType, unknown, HTMLElement, any> {
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
