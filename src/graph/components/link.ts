import LinkData from "../../server/LinkData";
import { toArray } from "../../utils";
import AdjacencyMap from "../AdjacencyMap";
import Link from "./links/Link";

export function linkDataToLinkObj(data: LinkData | LinkData[], map: AdjacencyMap): Link[] {
  data = toArray(data);
  const links: Link[] = [];
  for (let i = 0; i < data.length; i++) {
    links.push(new Link(data[i], map));
  }

  return links;
}
