import { links, nodes } from './server/data';
import GraphData from './server/GraphData';
import LinkData from './server/LinkData';
import NodeData from './server/NodeData';

export default class Server {
  nodes: NodeData[];
  links: LinkData[];
  nodeIdToNodeObj: Map<string, NodeData>;

  constructor() {
    this.loadData();
  }

  loadData() {
    this.nodes = JSON.parse(nodes);
    this.links = JSON.parse(links);

    // Construct helper data structures
    this.nodeIdToNodeObj = new Map();
    this.nodes.forEach((n) => this.nodeIdToNodeObj.set(n.id, n));
  }

  getRoot() {
    return this.nodes.filter((n) => n.id === '1')[0];
  }

  /**
   * Get neighbors and relationships between them and given node.
   * @param id Id of node to search for
   */
  getNeighbors(id: string): GraphData {
    const nodes = [],
          links = [];

    // Save each incoming/outgoing link and corresponding neighbor
    this.links.forEach((l) => {
      if (l.sourceId === id) {
        nodes.push(this.nodeIdToNodeObj.get(l.targetId));
        links.push(l);
      } else if (l.targetId === id) {
        nodes.push(this.nodeIdToNodeObj.get(l.sourceId));
        links.push(l);
      }
    });

    // Duplicates shouldn't matter since AdjacencyMap takes care of them.
    return {
      nodes: nodes,
      links: links
    };
  }
}
