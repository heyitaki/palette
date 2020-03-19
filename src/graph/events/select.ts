import Graph from "../../Graph";
import { LinkSelection, NodeSelection } from "../../types";

export function selectNodes(graph: Graph, nodes: NodeSelection, selected: boolean, toggle: boolean=false) {
  nodes.classed('selected', d => d.selected = toggle ? !d.selected : selected);
  selectLinks(graph.link);
}

export function selectLinks(links: LinkSelection, selected?: boolean, toggle: boolean=false) {
  if (!selected) links.classed('selected', l => l.source.selected && l.target.selected);
  else links.classed('selected', l => l.selected = toggle ? !l.selected : selected);
}
