import AdjacencyMap from "../graph/AdjacencyMap";
import Link from "../graph/components/links/Link";
import LinkData from "../server/LinkData";
import { toArray } from "../utils";

export default class LinkTransformer {
  public static linkDataToLinkObj(linkData: LinkData | LinkData[], 
      map: AdjacencyMap): Link[] {
    return toArray(linkData).map(data => new Link(data, map));
  }

  public static linkObjToLinkData(links: Link | Link[]): LinkData[] {
    return toArray(links).map(link => {
      return {
        id: link.id, 
        title: link.title,
        sourceId: link.source.id,
        targetId: link.target.id
      }
    });
  }
}
