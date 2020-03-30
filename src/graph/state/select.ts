import Graph from "../../Graph";
import { LinkSelection, NodeSelection } from "../../types";
import Link, { getLinkColor, setLinkColor } from "../components/links/Link";
import NodeClass from "../enums/NodeClass";

export function classNodes(graph: Graph, nodes: NodeSelection, 
    className: NodeClass, isClassed: boolean, toggle: boolean=false) {
  nodes.classed(className, d => d[className] = toggle ? !d[className] : isClassed);
  classLinks(graph, graph.link, className);
}

export function classLinks(graph: Graph, links: LinkSelection, 
    className: NodeClass, isClassed?: boolean, toggle: boolean=false) {
  links.classed(className, (l: Link) => { 
    return l[className] = (isClassed === undefined)
      ? l.source[className] && l.target[className]
      : toggle 
        ? !l[className] 
        : isClassed;
  });
  
  setLinkColor(graph, links, l => getLinkColor(l));
}
