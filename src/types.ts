import { BaseType, Selection } from 'd3-selection';
import Link from './graph/components/links/Link';
import Node from './graph/components/nodes/Node';

export type NodeSelection = Selection<any, Node, SVGGElement, unknown>;
export type LinkSelection = Selection<BaseType, Link, SVGGElement, unknown>;
