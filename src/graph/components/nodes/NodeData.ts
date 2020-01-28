import Point from "../../Point";

export default interface NodeData {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  color?: string;
  position?: Point;
}
