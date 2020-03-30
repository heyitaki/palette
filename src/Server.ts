import AdjacencyMap from "./graph/AdjacencyMap";
import Node from "./graph/components/nodes/Node";
import { links, nodes } from './server/data/data';
import GraphData from "./server/GraphData";
import LinkData from "./server/LinkData";
import NodeData from "./server/NodeData";
import LinkTransformer from "./transformers/LinkTransformer";
import NodeTransformer from "./transformers/NodeTransformer";
import { toArray } from "./utils";

export default class Server {
  adjacencyMap: AdjacencyMap;

  constructor() {
    this.adjacencyMap = new AdjacencyMap(null);
    const nodeData: NodeData[] = JSON.parse(nodes);
    const linkData: LinkData[] = JSON.parse(links);
    this.loadData(nodeData, linkData);
  }

  private loadData(nodeData: NodeData[], linkData: LinkData[]) {
    // Load all data into adjacency map
    this.adjacencyMap.addNodes(nodeData);
    this.adjacencyMap.addLinks(linkData);

    // Calculate total num links for each node
    this.adjacencyMap.getNodes().forEach(node => { node.totalLinks = 0; });
    this.adjacencyMap.getLinks().forEach(link => {
      this.adjacencyMap.nodeIdToNodeObj.get(link.source.id).totalLinks++;
      this.adjacencyMap.nodeIdToNodeObj.get(link.target.id).totalLinks++;
    });
  }

  getRoot(): NodeData {
    const rootNode: Node = this.adjacencyMap.getNodes('1')[0];
    return NodeTransformer.nodeObjToNodeData(rootNode)[0];
  }

  /**
   * Get neighboring nodes to each given node, as well as all incoming and 
   * outgoing links from each neighoring node, in case they connect to any 
   * existing nodes in the graph.
   * @param nodeIds Ids of nodes to get neighbors of
   */
  getNeighbors(nodeIds: string | string[]): GraphData {
    nodeIds = toArray(nodeIds);
    let linkIds: string[] = [], 
        nodes: Node[] = [], 
        neighbors: Node[],
        neighborId: string;

    for (let i = 0; i < nodeIds.length; i++) {
      neighbors = this.adjacencyMap.getNeighbors(nodeIds[i]);
      for (let j = 0; j < neighbors.length; j++) {
        neighborId = neighbors[j].id;
        linkIds = linkIds.concat([
          ...this.adjacencyMap.adjacencyMapIncoming.get(neighborId).values(),
          ...this.adjacencyMap.adjacencyMapOutgoing.get(neighborId).values()
        ]);
      }

      nodes = nodes.concat(neighbors);
    }
    
    const links = linkIds.map(id => this.adjacencyMap.linkIdToLinkObj.get(id));
    return { 
      nodes: NodeTransformer.nodeObjToNodeData(nodes),
      links: LinkTransformer.linkObjToLinkData(links)
    };
  }
}
