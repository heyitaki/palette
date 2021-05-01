import { NodeSelection } from '../../types';

/**
 * Pin nodes in place, so that the force layout no longer affects their positions.
 * @param nodes Selection of nodes to (un)pin.
 * @param isFixed Whether to pin or unpin given nodes.
 * @param toggle Toggle pinned state of given nodes. isFixed is ignored if this
 * is set to true.
 */
export function pinNodes(nodes: NodeSelection, isFixed: boolean, toggle: boolean = false): void {
  nodes.classed('fixed', (d) => {
    d.fixed = toggle ? !d.fixed : isFixed;
    d.fx = d.fixed ? d.x : null;
    d.fy = d.fixed ? d.y : null;
    return d.fixed;
  });
}
