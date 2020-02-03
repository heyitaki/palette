import _ from 'lodash';
import { exists, toArray } from '../utils';
import Link from './components/links/Link';
import Node from './components/nodes/Node';
import { MALFORMED_DATA, MISSING_LINK_ID } from './constants/error';

export default class AdjacencyMap {
  adjacencyMapOutgoing: Map<string, Map<string, string>>;
  adjacencyMapIncoming: Map<string, Map<string, string>>;
  nodeIdToNodeObj: Map<string, Node>;
  linkIdToLinkObj: Map<string, Link>;

  constructor() {
    this.adjacencyMapOutgoing = new Map(); // {srcNodeId : {targetNodeId : linkId}}
    this.adjacencyMapIncoming = new Map(); // {targetNodeId : {srcNodeId : linkId}}
    this.nodeIdToNodeObj = new Map(); // {nodeId : nodeObj}
    this.linkIdToLinkObj = new Map(); // {linkId : linkObj}
    // TODO: add data structures to hold links whose nodes haven't been added yet
  }
  
  /**
   * Get nodes corresponding to given ids or return all nodes if no ids are given.
   * @param idList Either a single id or a list of one or more ids.
   */
  getNodes = (idList?: string | string[]): Node[] => { 
    // If no arguments passed in, return all nodes
    if (idList === undefined) return Array.from(this.nodeIdToNodeObj.values());

    // Else return nodes corresponding to given ids
    idList = toArray(idList);
    const nodes: Node[] = [];
    for (let i = 0; i < idList.length; i++) {
      nodes.push(this.nodeIdToNodeObj.get(idList[i]));
    }

    return nodes;
  }

  /**
   * Get links corresponding to given ids or return all links if no ids are given.
   * @param idList Either a single id or a list of one or more ids.
   */
  getLinks = (idList?: string | string[]): Link[] => {
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
   * @param nodes Either a single node or a list of one or more nodes to add.
   */
  addNodes = (nodes: Node | Node[]): void => {
    nodes = toArray(nodes);

    // Only consider each new node if it's not in the graph or a duplicate 
    // within the input list
    nodes = _.uniqBy(nodes, n => n.id);
    const nodesToConsider = _.differenceBy(nodes, this.getNodes(), n => n.id);

    // Add nodes to map
    let currNode;
    for (let i = 0; i < nodesToConsider.length; i++) {
      currNode = nodesToConsider[i];
      this.adjacencyMapOutgoing.set(currNode.id, new Map());
      this.adjacencyMapIncoming.set(currNode.id, new Map());
      this.nodeIdToNodeObj.set(currNode.id, currNode);
    }
  }

  /**
   * Add given links to adjacency map if they haven't already been added.
   * @param links Either a single link or a list of one or more links to add.
   */
  addLinks = (links: Link | Link[]): void => {
    links = toArray(links);
    let currLink, linkId, source, target, sourceId, targetId;
    for (let i = 0; i < links.length; i++) {
      currLink = links[i];
      linkId = currLink.id;
      source = currLink.source;
      target = currLink.target;

      // If source and target are references to node objects, do nothing
      // Else replace node ids with references to the nodes
      if (!currLink || !exists(linkId)) throw MISSING_LINK_ID;
      if (!exists(source) || !exists(target)) throw MALFORMED_DATA;
      if (!exists(source.id)) links[i].source = this.getNodes(source)[0];
      if (!exists(target.id)) links[i].target = this.getNodes(target)[0];

      // Add link
      sourceId = currLink.source.id;
      targetId = currLink.target.id;
      this.adjacencyMapOutgoing.get(sourceId).set(targetId, linkId);
      this.adjacencyMapIncoming.get(targetId).set(sourceId, linkId);
      this.linkIdToLinkObj.set(linkId, currLink);
    }
  }

  /**
   * Remove given nodes from adjacency map.
   * @param nodes Either a single node or a list of one or more nodes to remove.
   */
  deleteNodes = (nodes: Node | Node[]): void => {
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
  }

  /**
   * Remove given links from adjacency map.
   * @param links Either a single link or a list of one or more links to remove.
   */
  deleteLinks = (links: Link | Link[]): void => {
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
  }

  /**
   * Determine if nodes corresponding to given ids are linked in the direction 
   * specified.
   * @param sourceId Id of source node.
   * @param targetId Id of target node.
   * @param directed Whether to only consider a link from source to target or 
   * both directions.
   */
  areNeighbors = (sourceId: string, targetId: string, directed=false): boolean => {
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
  getNeighbors = (nodeId: string, directed=false): Node[] => {
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
