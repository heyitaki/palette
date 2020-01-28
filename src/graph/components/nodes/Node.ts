import Point from "../../Point";

export default interface Node {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  color?: string;
  position?: Point;
  renderNode(gNodeRef: any): void;
  calcLinkPosition(link: any, isSource: boolean): void;
  getCenter(node: any): Point;
}
