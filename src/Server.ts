import { links, nodes } from './server/data';
import _ from 'lodash';

export default class Server {
  nodes;
  links;
  nodeIdToNode;

  constructor() {
    this.loadData();
  }

  loadData() {
    this.nodes = JSON.parse(nodes);
    this.links = JSON.parse(links);

    // Construct helper data structures
    this.nodeIdToNode = new Map();
    this.nodes.forEach((n) => this.nodeIdToNode[n.id] = n);
  }

  getRoot() {
    return this.nodes.filter((n) => n.id === 1)[0];
  }

  /**
   * Get neighbors and relationships between them and given node.
   * @param id Id of node to search for
   */
  getNeighbors(id) {
    const nodes = [],
          links = [];

    // Save each incoming/outgoing link and corresponding neighbor
    this.links.forEach((l) => {
      if (l.source === id) {
        nodes.push(this.nodeIdToNode[l.target]);
        links.push(l);
      } else if (l.target === id) {
        nodes.push(this.nodeIdToNode[l.source]);
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