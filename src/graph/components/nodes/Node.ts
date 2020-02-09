import Point from "../../Point";
import Link from "../links/Link";

export default interface Node {
  id: string;
  type: string;
  title: string;
  weight: number;
  description?: string;
  url?: string;
  color?: string;
  x?: number;
  y?: number;
  renderNode(gNodeRef: any): void;
  getLinkPosition(link: Link): Point;
  getCenter(): Point;
}
