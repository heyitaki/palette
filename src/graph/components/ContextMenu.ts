import { event, select, selectAll } from 'd3-selection';
import { MenuSelection, NodeSelection } from '../../types';
import { CONTEXT_MENU_HEIGHT, CONTEXT_MENU_WIDTH } from '../constants/graph';
import Graph from '../Graph';
import { getDataFromSelection, getSelectedNodes } from '../selection';
import { expandNodes } from '../state/expand';
import { pinNodes } from '../state/pin';
import Node from './nodes/Node';

interface MenuItem {
  title: (d?: Node, i?: number, nodes?: NodeSelection) => string;
  icon: string;
  action: (nodes: NodeSelection) => void;
  code: string;
  children?: MenuItem[];
}

/**
 * Context menu containing custom graph actions.
 * Loosely inspired by https://github.com/patorjk/d3-context-menu.
 */
export default class ContextMenu {
  graph: Graph;
  isOpen: boolean;
  menuItems: MenuItem[];

  constructor(graph: Graph) {
    this.graph = graph;
    this.isOpen = false;
  }

  public openMenu = (n: Node, i: number) => {
    this.closeMenu();
    this.isOpen = true;
    this.menuItems = getMenuItems(this.graph);

    // Create the div element that will hold the context menu
    selectAll('.d3-context-menu')
      .data([1])
      .enter()
      .append('div')
      .attr('class', 'd3-context-menu d3-context-menu-theme');

    // Close menu on mousedown outside of canvas
    select('body').on('mousedown.d3-context-menu', this.closeMenu);

    // Right-clicking menu closes it
    const gMenu = selectAll('.d3-context-menu').on('contextmenu', () => {
      this.closeMenu();
      event.preventDefault();
      event.stopPropagation();
    });

    // Populate action menu
    const parent: MenuSelection = gMenu.append('ul').attr('class', 'action-menu');
    const nodes: NodeSelection = getSelectedNodes(this.graph);
    parent.call(this.createNestedMenu, this, n, i, nodes);

    // Get position and display context menu
    const CLICK_OFFSET = 2;
    const pageWidth = window.innerWidth || document.documentElement.clientWidth;
    const pageHeight = window.innerHeight || document.documentElement.clientHeight;
    let xAlign: string, xAlignReset: string, xAlignValue: string;
    if (event.pageX + CONTEXT_MENU_WIDTH < pageWidth) {
      xAlign = 'left';
      xAlignReset = 'right';
      xAlignValue = event.pageX - CLICK_OFFSET + 'px';
    } else {
      xAlign = 'right';
      xAlignReset = 'left';
      xAlignValue = pageWidth - event.pageX - CLICK_OFFSET + 'px';
    }

    let yAlign: string, yAlignReset: string, yAlignValue: string;
    if (event.pageY + CONTEXT_MENU_HEIGHT < pageHeight) {
      yAlign = 'top';
      yAlignReset = 'bottom';
      yAlignValue = event.pageY - CLICK_OFFSET + 'px';
    } else {
      yAlign = 'bottom';
      yAlignReset = 'top';
      yAlignValue = pageHeight - event.pageY - CLICK_OFFSET + 'px';
    }

    select('.d3-context-menu')
      .style(xAlign, xAlignValue)
      .style(xAlignReset, null)
      .style(yAlign, yAlignValue)
      .style(yAlignReset, null)
      .style('display', 'block');

    event.preventDefault();
    event.stopPropagation();
  };

  public closeMenu = () => {
    if (this.isOpen) {
      select('.d3-context-menu').remove();
      select('body').on('mousedown.d3-context-menu', null);
      this.isOpen = false;
    }
  };

  private createNestedMenu = (
    parent: MenuSelection,
    root: ContextMenu,
    n: Node,
    i: number,
    nodes: NodeSelection,
    depth = 0,
  ) => {
    parent
      .selectAll('li')
      .data(function (mi: MenuItem): MenuItem[] {
        return depth === 0 ? root.menuItems : mi.children;
      })
      .enter()
      .append('li')
      .each(function (mi: MenuItem) {
        const listItem = select(this)
          .classed('context-menu-parent', !!mi.children)
          .html(
            `
              <div class="context-menu-left">
                ${mi.icon ? `<img src=${mi.icon}>` : ''}
                <p class="${mi.icon ? '' : 'context-menu-no-icon'}">
                  ${mi.title(n, i, nodes)}
                </p>
              </div>
              <p class="context-menu-code">${mi.code}</p>
            `,
          )
          .on('click', function () {
            event.stopPropagation();
            // Do nothing if no action
            if (!mi.action) return;

            // Get selection, always pass in node id, only used when selecting current node
            mi.action(nodes);
            root.closeMenu();
          });

        if (mi.children) {
          // Create children(`next parent`) and call recursive
          const children: MenuSelection = listItem
            .append('ul')
            .classed('context-menu-children', true);
          root.createNestedMenu(children, root, n, i, nodes, ++depth);
        }
      });
  };
}

const getMenuItems = (graph: Graph): MenuItem[] => {
  return [
    {
      title: (d, i, nodes) => {
        const subject = nodes.size() > 1 ? 'nodes' : 'node';
        return `Expand ${subject}`;
      },
      icon: './icons/expand.svg',
      action: (nodes) => {
        expandNodes(graph, nodes);
      },
      code: 'shift+e',
    },
    {
      title: (d, i, nodes) => {
        if (!nodes || nodes.size() === 0) return 'Pin node';
        const subject = nodes.size() > 1 ? 'nodes' : 'node';
        const numSelected = nodes
          .filter((dx) => {
            return dx.fixed || false;
          })
          .size();
        const action = numSelected < nodes.size() ? 'Pin' : 'Unpin';
        return `${action} ${subject}`;
      },
      icon: './icons/pin.svg',
      action: (nodes) => pinNodes(nodes, null, true),
      code: 'shift+f',
      children: [
        {
          title: () => 'Pin',
          icon: './icons/pin.svg',
          action: (nodes) => pinNodes(nodes, true),
          code: '',
        },
        {
          title: () => 'Unpin',
          icon: './icons/unpin.svg',
          action: (nodes) => pinNodes(nodes, false),
          code: '',
        },
        {
          title: () => 'Toggle',
          icon: './icons/toggle.svg',
          action: (nodes) => pinNodes(nodes, null, true),
          code: '',
        },
      ],
    },
    {
      title: (d, i, nodes) => {
        const subject = nodes.size() > 1 ? 'nodes' : 'node';
        return `Remove ${subject}`;
      },
      icon: './icons/remove.svg',
      action: (nodes) => {
        const nodesToDelete = getDataFromSelection(nodes);
        graph.adjacencyMap.deleteNodes(nodesToDelete, true);
      },
      code: 'shift+r',
    },
  ];
};
