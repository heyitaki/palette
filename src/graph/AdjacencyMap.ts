import _ from 'lodash';
import Graph from '../Graph';
import LinkData from '../server/LinkData';
import NodeData from '../server/NodeData';
import { exists, getMapVal, linkDataToLinkObj, nodeDataToNodeObj, toArray } from '../utils';
import Link from './components/links/Link';
import Node from './components/nodes/Node';
import { MALFORMED_DATA, MISSING_LINK_ID } from './constants/error';

export default class AdjacencyMap {
  graph: Graph;
  adjacencyMapOutgoing: Map<string, Map<string, string>>;
  adjacencyMapIncoming: Map<string, Map<string, string>>;
  nodeIdToNodeObj: Map<string, Node>;
  linkIdToLinkObj: Map<string, Link>;
  futureNodes: Map<string, LinkData[]>;

  constructor(graph: Graph) {
    this.graph = graph;
    this.adjacencyMapOutgoing = new Map(); // {srcNodeId: {targetNodeId: linkId}}
    this.adjacencyMapIncoming = new Map(); // {targetNodeId: {srcNodeId: linkId}}
    this.nodeIdToNodeObj = new Map(); // {nodeId: nodeObj}
    this.linkIdToLinkObj = new Map(); // {linkId: linkObj}
    this.futureNodes = new Map(); // {futureNodeId: [deferredLinkData]}
  }
  
  /**
   * Get nodes corresponding to given ids or return all nodes if no ids are given.
   * @param idList Either a single id or a list of one or more ids.
   */
  public getNodes = (idList?: string | string[]): Node[] => { 
    // If no arguments passed in, return all nodes
    if (idList === undefined) return Array.from(this.nodeIdToNodeObj.values());

    // Else return nodes corresponding to given ids
    idList = toArray(idList);
    const nodes: Node[] = [];
    for (let i = 0; i < idList.length; i++) {
      nodes.push(this.nodeIdToNodeObj.get(idList[i]));
    }

    // Filter out results for those given ids which have no corresponding node
    return nodes.filter(node => node != undefined);
  }

  /**
   * Get links corresponding to given ids or return all links if no ids are given.
   * @param idList Either a single id or a list of one or more ids.
   */
  public getLinks = (idList?: string | string[]): Link[] => {
    // If no arguments passed in, return all nodes
    if (idList === undefined) return Array.from(this.linkIdToLinkObj.values());

    // Else return nodes corresponding to given ids
    idList = toArray(idList);
    const links: Link[] = [];
    for (let i = 0; i < idList.length; i++) {
      links.push(this.linkIdToLinkObj.get(idList[i]));
    }

    return links;
  }

  /**
   * Add given nodes to adjacency map if they haven't already been added.
   * @param nodeData Either a single nodeData or list of one or more nodes to add.
   * @param update Whether or not to visually update graph to reflect changes.
   */
  public addNodes = (nodeData: NodeData | NodeData[], update=false): void => {
    nodeData = toArray(nodeData);
    let nodes = nodeDataToNodeObj(this.graph, nodeData);

    // Only consider each new node if it's not in the graph or a duplicate 
    // within the input list
    nodes = _.uniqBy(nodes, n => n.id);
    const nodesToConsider = _.differenceBy(nodes, this.getNodes(), n => n.id);

    // Add nodes to map
    let currNode: Node, 
        deferredLinkData: LinkData[] = [];
    for (let i = 0; i < nodesToConsider.length; i++) {
      currNode = nodesToConsider[i];
      this.adjacencyMapOutgoing.set(currNode.id, new Map());
      this.adjacencyMapIncoming.set(currNode.id, new Map());
      this.nodeIdToNodeObj.set(currNode.id, currNode);

      // Add deferred links that now have both bounding nodes added
      if (this.futureNodes.has(currNode.id)) {
        deferredLinkData.concat(this.futureNodes.get(currNode.id));
        this.futureNodes.delete(currNode.id);
      }
    }

    if (deferredLinkData.length > 0) {
      deferredLinkData = _.uniqBy(deferredLinkData, ld => ld.id);
      this.addLinks(deferredLinkData);
    }

    if (update) this.graph.updateGraph();
  }

  /**
   * Add given links to adjacency map if they haven't already been added.
   * @param linkData Either a single link or a list of one or more links to add.
   * @param update Whether or not to visually update graph to reflect changes.
   */
  public addLinks = (linkData: LinkData | LinkData[], update=false): void => {
    linkData = _.uniqBy(toArray(linkData), ld => ld.id);
    linkData = _.differenceBy(linkData, this.getLinks(), ld => ld.id);

    let linkDatum: LinkData;
    for (let i = 0; i < linkData.length; i++) {
      linkDatum = linkData[i];
      if (!linkDatum || !exists(linkDatum.id)) console.error(MISSING_LINK_ID);
      if (!exists(linkDatum.sourceId) || !exists(linkDatum.targetId)) {
        console.error(MALFORMED_DATA, linkDatum);
      }

      // If source and target nodes have been added to map, add link between them
      // Else defer link until bounding nodes are added
      const source: Node = this.getNodes(linkDatum.sourceId)[0],
            target: Node = this.getNodes(linkDatum.targetId)[0];
      if (source && target) {
        // Add link
        const link: Link = linkDataToLinkObj(this.graph, linkDatum)[0];
        this.adjacencyMapOutgoing.get(source.id).set(target.id, link.id);
        this.adjacencyMapIncoming.get(target.id).set(source.id, link.id);
        this.linkIdToLinkObj.set(link.id, link);
      } else {
        // Defer link creation
        if (!source) getMapVal(this.futureNodes, linkDatum.sourceId, []).push(linkDatum);
        if (!target) getMapVal(this.futureNodes, linkDatum.targetId, []).push(linkDatum);
      }
    }

    if (update) this.graph.updateGraph();
  }

  /**
   * Remove given nodes from adjacency map.
   * @param nodes Either a single node or a list of one or more nodes to remove.
   * @param update Whether or not to visually update graph to reflect changes.
   */
  public deleteNodes = (nodes: Node | Node[], update=false): void => {
    nodes = toArray(nodes);
    let nodeId: string;
    for (let i = 0; i < nodes.length; i++) {
      // Delete incoming links
      this.adjacencyMapOutgoing.get(nodeId).forEach((linkId, targetId) => {
        this.adjacencyMapIncoming.get(targetId).delete(nodeId);
      });
      
      // Delete outgoing links
      this.adjacencyMapIncoming.get(nodeId).forEach((linkId, sourceId) => {
        this.adjacencyMapOutgoing.get(sourceId).delete(nodeId);
      });

      // Delete node
      this.adjacencyMapOutgoing.delete(nodeId);
      this.adjacencyMapIncoming.delete(nodeId);
      this.nodeIdToNodeObj.delete(nodeId);
    }

    if (update) this.graph.updateGraph();
  }

  /**
   * Remove given links from adjacency map.
   * @param links Either a single link or a list of one or more links to remove.
   * @param update Whether or not to visually update graph to reflect changes.
   */
  public deleteLinks = (links: Link | Link[], update=false): void => {
    links = toArray(links);
    let currLink, sourceId, targetId;
    for (let i = 0; i < links.length; i++) {
      currLink = links[i];
      sourceId = currLink.source.id;
      targetId = currLink.target.id;

      // Delete link from mappings
      this.adjacencyMapOutgoing.get(sourceId).delete(targetId);
      this.adjacencyMapIncoming.get(targetId).delete(sourceId);
      this.linkIdToLinkObj.delete(currLink.id);
    }

    if (update) this.graph.updateGraph();
  }

  /**
   * Determine if nodes corresponding to given ids are linked in the direction 
   * specified.
   * @param sourceId Id of source node.
   * @param targetId Id of target node.
   * @param directed Whether to only consider a link from source to target or 
   * both directions.
   */
  public areNeighbors = (sourceId: string, targetId: string, directed=false): boolean => {
    // Check for outgoing link (and incoming link if we're not performing directional lookup)
    let areNeighbors = this.adjacencyMapOutgoing.get(sourceId).get(targetId);
    if (!directed) areNeighbors = areNeighbors || this.adjacencyMapOutgoing.get(targetId).get(sourceId);
    return (sourceId != targetId) && (areNeighbors != null);
  }

  /**
   * Return all nodes linked to node corresponding to given id in the direction 
   * specified.
   * @param nodeId Id of node to get neighbors of.
   * @param directed Whether to only consider a link from source to target or 
   * both directions.
   */
  public getNeighbors = (nodeId: string, directed=false): Node[] => {
    const neighbors: Node[] = [];

    // Find outgoing links
    this.adjacencyMapOutgoing.get(nodeId).forEach((linkId, targetId) => {
      neighbors.push(this.nodeIdToNodeObj.get(targetId));
    });

    if (directed) return neighbors;

    // Find incoming links
    this.adjacencyMapIncoming.get(nodeId).forEach((linkId, sourceId) => {
      neighbors.push(this.nodeIdToNodeObj.get(sourceId));
    });

    return neighbors;
  }
}
