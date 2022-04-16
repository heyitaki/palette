import { LinkSelection, NodeSelection } from '../../types';
import Link, { getLinkColor, setLinkColor } from '../components/links/Link';
import NodeClass from '../enums/NodeClass';
import Graph from '../Graph';

/**
 * Add, remove, or toggle `selected` or `possible` classes to given links.
 * @param graph Graph in which given nodes exist
 * @param nodes Selection of nodes to modify
 * @param className Which node state to modify
 * @param isClassed What to set state of given nodes to
 * @param toggle Whether to toggle state, `isClassed` ignored if this is set
 */
export function classNodes(
  graph: Graph,
  nodes: NodeSelection,
  className: NodeClass,
  isClassed: boolean,
  toggle: boolean = false,
) {
  nodes.classed(className, (n) => (n[className] = toggle ? !n[className] : isClassed));
  classLinks(graph, graph.links, className);
}

/**
 * Add, remove, or toggle `selected` or `possible` classes to given links. If
 * action is unspecified, deduce how each link is classed based on bounding
 * nodes.
 * @param graph Graph in which given links exist
 * @param links Selection of links to modify
 * @param className Which link state to modify
 * @param isClassed New link state
 * @param toggle Whether to toggle state, `isClassed` ignored if this is set
 */
export function classLinks(
  graph: Graph,
  links: LinkSelection,
  className: NodeClass,
  isClassed?: boolean,
  toggle: boolean = false,
) {
  links.classed(className, (l: Link) => {
    return (l[className] =
      isClassed === undefined
        ? l.source[className] && l.target[className]
        : toggle
        ? !l[className]
        : isClassed);
  });

  setLinkColor(graph, links, (l) => getLinkColor(l));
}
