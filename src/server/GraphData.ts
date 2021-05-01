import LinkData from './LinkData';
import NodeData from './NodeData';

export default interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}
