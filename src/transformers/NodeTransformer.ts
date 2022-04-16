import Card from '../graph/components/nodes/Card';
import Circle from '../graph/components/nodes/Circle';
import Node from '../graph/components/nodes/Node';
import { NODE_THIN_CARD_HEIGHT } from '../graph/constants/graph';
import Graph from '../graph/Graph';
import NodeData from '../server/NodeData';
import { toArray } from '../utils';

export default class NodeTransformer {
  public static nodeDataToNodeObj(nodeData: NodeData | NodeData[], graph: Graph): Node[] {
    return toArray(nodeData).map((data: NodeData) => {
      switch (data.type.toLowerCase()) {
        case 'intro':
          return new Card(data, graph);
        default:
          return new Circle(data, graph);
      }
    });
  }

  public static nodeObjToNodeData(nodes: Node | Node[]): NodeData[] {
    return toArray(nodes).map((node: Node) => {
      return {
        id: node.id,
        type: node.type,
        title: node.title,
        description: node.description,
        url: node.url,
        color: node.color,
        totalLinks: node.totalLinks || 0,
        x: node.x,
        y: node.y,
      };
    });
  }
}
