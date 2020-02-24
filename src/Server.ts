import { links, nodes } from './server/data/data';
import GraphData from './server/GraphData';
import LinkData from './server/LinkData';
import NodeData from './server/NodeData';
import { toArray } from './utils';

export default class Server {
  private nodes: NodeData[];
  private links: LinkData[];
  private nodeIdToNodeData: Map<string, NodeData>;

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.nodes = JSON.parse(nodes);
    this.links = JSON.parse(links);

    // Construct helper data structures
    this.nodeIdToNodeData = new Map();
    this.nodes.forEach((n: NodeData) => {
      n.totalLinks = 0;
      this.nodeIdToNodeData.set(n.id, n);
    });
    
    // Calculate totalLinks field for nodes
    this.links.forEach((l: LinkData) => {
      this.nodeIdToNodeData.get(l.sourceId).totalLinks++;
      this.nodeIdToNodeData.get(l.targetId).totalLinks++;
    });
  }

  public getRoot() {
    return this.nodes.filter((n) => n.id === '1')[0];
  }

  /**
   * Get neighbors and relationships between them and given node.
   * @param id Id of node to search for
   */
  public getNeighbors(ids: string | string[]): GraphData {
    ids = toArray(ids);
    const nodes = [],
          links = [];

    // Save each incoming/outgoing link and corresponding neighbor
    for (let i = 0; i < ids.length; i++) {
      this.links.forEach((l) => {
        if (l.sourceId === ids[i]) {
          nodes.push(this.nodeIdToNodeData.get(l.targetId));
          links.push(l);
        } else if (l.targetId === ids[i]) {
          nodes.push(this.nodeIdToNodeData.get(l.sourceId));
          links.push(l);
        }
      });
    }

    // Duplicates shouldn't matter since AdjacencyMap takes care of them.
    return {
      nodes: nodes,
      links: links
    };
  }
}
