import Graph from "../../Graph";
import { LinkSelection, NodeSelection } from "../../types";
import Link, { getLinkColor, setLinkColor } from "../components/links/Link";

export function selectNodes(graph: Graph, nodes: NodeSelection, 
    selected: boolean, toggle: boolean=false) {
  nodes.classed('selected', d => d.selected = toggle ? !d.selected : selected);
  selectLinks(graph, graph.link);
}

export function selectLinks(graph: Graph, links: LinkSelection, 
    selected?: boolean, toggle: boolean=false) {
  links.classed('selected', (l: Link) => { 
    return l.selected = !selected
      ? l.source.selected && l.target.selected
      : toggle 
        ? !l.selected 
        : selected;
  });
  
  setLinkColor(graph, links, l => getLinkColor(l));
}
