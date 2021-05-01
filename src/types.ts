import { BaseType, Selection } from 'd3-selection';
import { Transition } from 'd3-transition';
import Link from './graph/components/links/Link';
import Node from './graph/components/nodes/Node';

export type NodeSelection = Selection<any, Node, SVGGElement, unknown>;
export type LinkSelection = Selection<BaseType, Link, SVGGElement, unknown>;
export type MenuSelection = Selection<HTMLUListElement, unknown, HTMLElement, any>;

export type NodeTransition = Transition<any, Node, SVGGElement, unknown>;
export type LinkTransition = Transition<BaseType, Link, SVGGElement, unknown>;