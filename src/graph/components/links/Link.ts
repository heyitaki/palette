import LinkData from '../../../server/LinkData';
import AdjacencyMap from '../../AdjacencyMap';
import Node from '../nodes/Node';

export default class Link {
  bidirectional: boolean;
  color: string;
  id: string;
  possible: boolean;
  selected: boolean;
  source: Node;
  target: Node;
  title: string;
  length?: number;

  constructor(data: LinkData, map: AdjacencyMap) {
    this.bidirectional = data.bidirectional;
    this.id = data.id;
    this.title = data.title;
    this.color = '#545454';
    this.length = 0;
    this.possible = false;
    this.selected = false;
    this.source = map.getNodes(data.sourceId)[0];
    this.target = map.getNodes(data.targetId)[0];
  }
}
