import _ from 'lodash';
import { MALFORMED_DATA } from './map/constants/error';
import { toArray, exists } from './map/utils';

export default class AdjacencyMap {
  adjacencyMapOutgoing;
  adjacencyMapIncoming;
  nodeIdToNodeData;
  linkIdToLinkData;
  allNodes;
  allLinks;

  constructor() {
    this.adjacencyMapOutgoing = new Map(); // {srcNodeId : {targetNodeId : linkId}}
    this.adjacencyMapIncoming = new Map(); // {targetNodeId : {srcNodeId : linkId}}
    this.nodeIdToNodeData = {}; // {nodeId : nodeData}
    this.linkIdToLinkData = {}; // {linkId : linkData}
    this.allNodes = []; // [nodeData]
    this.allLinks = []; // [linkData]
  }

  getNodes = (idList) => {
    // If no arguments passed in, return all nodes
    if (idList === undefined) return this.allNodes;

    // Else return nodes corresponding to given ids
    if (!exists(idList) || idList.length === 0) return;
    idList = toArray(idList);

    let nodeData;
    const nodes = [];
    for (let i = 0; i < idList.length; i++) {
      nodeData = this.nodeIdToNodeData[idList[i]];
      if (nodeData === undefined) continue;
      nodes.push(nodeData);
    }

    return nodes;
  }

  getLinks = () => {
    return this.allLinks;
  }

  addNodes = (nodes=[]) => {
    if (!nodes || nodes.length === 0) return;
    nodes = toArray(nodes);

    // Only consider each new node if it's not in the graph or a duplicate within the input list
    nodes = _.uniqBy(nodes, (obj) => { return obj.id; });
    const nodesToConsider = _.differenceBy(nodes, this.allNodes, (obj) => { return obj.id; });

    // Add nodes to map
    let currNode;
    for (let i = 0; i < nodesToConsider.length; i++) {
      currNode = nodesToConsider[i];
      this.adjacencyMapOutgoing.set(currNode.id, new Map());
      this.adjacencyMapIncoming.set(currNode.id, new Map());
      this.nodeIdToNodeData[currNode.id] = currNode;
    }
    
    // Update internal list of nodes
    this.allNodes = this.allNodes.concat(nodesToConsider);
  }

  addLinks = (links=[]) => {
    if (!links || links.length === 0) return;
    links = toArray(links);

    let currLink, linkId, source, target, sourceId, targetId;
    for (let i = 0; i < links.length; i++) {
      currLink = links[i];
      linkId = currLink.id;
      source = currLink.source;
      target = currLink.target;

      // If source and target are references to node objects, do nothing
      // Else replace node ids with references to the nodes
      if (!currLink || !exists(linkId)) continue;
      if (!exists(source) || !exists(target)) throw MALFORMED_DATA;
      if (!exists(source.id)) links[i].source = this.getNodes(source)[0];
      if (!exists(target.id)) links[i].target = this.getNodes(target)[0];

      // Add link
      sourceId = currLink.source.id;
      targetId = currLink.target.id;
      this.adjacencyMapOutgoing.get(sourceId).set(targetId, linkId);
      this.adjacencyMapIncoming.get(targetId).set(sourceId, linkId);
      this.linkIdToLinkData[linkId] = currLink;
    }

    // Update internal list of links
    this.allLinks = _.uniqBy(this.allLinks.concat(links), (obj: any) => { return obj.id; });
  }

  deleteNodes = (nodes=[], hi) => {
    if (!nodes || nodes.length === 0) return; 
    nodes = toArray(nodes);

    const self = this;
    const linksToDelete = [];
    let nodeId, sourceId, numLinksLeft;

    for (let i = 0; i < nodes.length; i++) {
      // If any given nodes are invalid, skip instead of throwing error
      if (!nodes[i] || !(nodeId = _.get(nodes[i], 'id'))) continue;
      if (!this.adjacencyMapOutgoing.get(nodeId)) continue;

      // Delete incoming/outgoing links
      this.adjacencyMapOutgoing.get(nodeId).forEach(
        function(linkId, targetId) {
          linksToDelete.push(self.linkIdToLinkData[linkId]);
          self.adjacencyMapIncoming.get(targetId).delete(nodeId);
        }
      );

      this.adjacencyMapIncoming.get(nodeId).forEach(
        function(linkId, sourceId) {
          linksToDelete.push(self.linkIdToLinkData[linkId]);
          self.adjacencyMapOutgoing.get(sourceId).delete(nodeId);
        }
      );

      // Delete mappings
      this.adjacencyMapOutgoing.delete(nodeId);
      this.adjacencyMapIncoming.delete(nodeId);
      this.nodeIdToNodeData[nodeId] = undefined;
    }

    // Update internal lists of nodes and links
    this.allNodes = _.differenceBy(this.allNodes, nodes, (obj) => { return obj.id; });
    this.allLinks = _.differenceBy(this.allLinks, linksToDelete, (obj) => { return obj.id; });
  }

  deleteLinks = (links=[]) => {
    if (!links || links.length === 0) return;
    links = toArray(links);

    let currLink, sourceId, targetId;
    for (let i = 0; i < links.length; i++) {
      // If any given nodes are invalid, skip instead of throwing error
      currLink = links[i];
      sourceId = _.get(currLink, 'source.id', null);
      targetId = _.get(currLink, 'target.id', null);
      if (!sourceId || !targetId) continue;

      // Remove link from map
      this.adjacencyMapOutgoing.get(sourceId).delete(targetId);
      this.adjacencyMapIncoming.get(targetId).delete(sourceId);
      this.linkIdToLinkData[currLink.id] = undefined;
    }

    // Update internal list of links
    this.allLinks = _.differenceBy(this.allLinks, links, (obj) => { return obj.id; });
  }

  areNeighbors = (sourceId, targetId, directed=false) => {
    // Check for outgoing link (and incoming link if we're not performing directional lookup)
    let areNeighbors = this.adjacencyMapOutgoing.get(sourceId).get(targetId);
    if (!directed) areNeighbors = areNeighbors || this.adjacencyMapOutgoing.get(targetId).get(sourceId);
    return (sourceId != targetId) && (areNeighbors != null);
  }

  getNeighbors = (nodeId, directed=false) => {
    if (!this.adjacencyMapIncoming.get(nodeId)) return [];
    const neighbors = [];

    // Find outgoing links
    this.adjacencyMapOutgoing.get(nodeId).forEach((targetId, linkId) => {
      neighbors.push(this.nodeIdToNodeData[targetId]);
    });

    if (directed) return neighbors;

    // Find incoming links
    this.adjacencyMapIncoming.get(nodeId).forEach((sourceId, linkId) => {
      neighbors.push(this.nodeIdToNodeData[sourceId]);
    });

    return neighbors;
  }
}
