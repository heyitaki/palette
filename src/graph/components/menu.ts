import { event, select, selectAll } from 'd3-selection';
import { getSelectedNodes } from '../selection';
import { expandNodes } from '../state/expand';
import { pinNodes } from '../state/pin';
import { removeNodes } from '../state/remove';

export function getActionMenu() {
  return [
    {
      title: (d, i, nodes) => {
        const subject = (nodes.size() > 1) ? 'nodes' : 'node';
        return `Expand ${subject}`; 
      },
      icon: './icons/expand.svg',
      action: (nodes) => { expandNodes.bind(this)(nodes); },
      code: 'shift+e'
    },
    {
      title: (d, i, nodes) => {
        if (!nodes || nodes.size() === 0) return 'Pin node';
        const subject = (nodes.size() > 1) ? 'nodes' : 'node';
        const numSelected = nodes.filter((dx) => { return dx.fixed || false; }).size();
        const action = numSelected < nodes.size() ? 'Pin' : 'Unpin';
        return `${action} ${subject}`; 
      },
      icon: './icons/pin.svg',
      action: (nodes) => { pinNodes.bind(this)(nodes, null, true); },
      code: 'shift+f',
      children: [
        {
          title: 'Pin',
          icon: './icons/pin.svg',
          action: (nodes) => { pinNodes.bind(this)(nodes, true); },
          codes: {
            'Current node': '',
            'Selected nodes': '',
            'All nodes': ''
          }
        },
        {
          title: 'Unpin',
          icon: './icons/unpin.svg}',
          action: (nodes) => { pinNodes.bind(this)(nodes, false); },
          codes: {
            'Current node': '',
            'Selected nodes': '',
            'All nodes': ''
          }
        },
        {
          title: 'Toggle',
          icon: './icons/toggle.svg',
          action: (nodes) => { pinNodes.bind(this)(nodes, null, true); },
          codes: {
            'Current node': '',
            'Selected nodes': '',
            'All nodes': ''
          }
        },
      ] 
    },
    {
      title: (d, i, nodes) => {
        const subject = (nodes.size() > 1) ? 'nodes' : 'node';
        return `Remove ${subject}`; 
      },
      icon: './icons/remove.svg',
      action: (nodes) => { removeNodes.bind(this)(nodes); },
      code: 'shift+r'
    },
  ];
}

export function hideContextMenu() {
  this.contextMenu('close');
}

export function createContextMenu() {
  const self = this;
  const utils = {
    noop: function () {},

    /**
     * @param {*} value
     * @returns {Boolean}
     */
    isFn: function (value) {
      return typeof value === 'function';
    },

    /**
     * @param {*} value
     * @returns {Function}
     */
    const: function (value) {
      return function () { return value; };
    },

    /**
     * @param {Function|*} value
     * @param {*} [fallback]
     * @returns {Function}
     */
    toFactory: function (value, fallback?) {
      value = (value === undefined) ? fallback : value;
      return utils.isFn(value) ? value : utils.const(value);
    }
  };

  // Global state for d3-context-menu
  let d3ContextMenu = null;

  const closeMenu = function () {
    // Global state is populated if a menu is currently opened
    if (d3ContextMenu) {
      select('.d3-context-menu').remove();
      select('body').on('mousedown.d3-context-menu', null);
      d3ContextMenu.boundCloseCallback();
      d3ContextMenu = null;
    }
  };

  /**
   * Calls API method (e.g. `close`) or returns handler function for the `contextmenu` event
   * @param {Function|Array|String} actionMenuItems
   * @param {Function|Object} config
   * @returns {?Function}
   */
  return function (actionMenuItems, config) {
    // Allow 'contextMenu('close')` to programatically close the menu
    if (actionMenuItems === 'close') {
        return closeMenu();
    }

    // For convenience, make `actionMenuItems` a factory and `config` an object
    actionMenuItems = utils.toFactory(actionMenuItems);

    if (utils.isFn(config)) config = { onOpen: config };
    else config = config || {};

    // Resolve config
    const openCallback = config.onOpen || utils.noop;
    const closeCallback = config.onClose || utils.noop;
    const positionFactory = utils.toFactory(config.position);
    const themeFactory = utils.toFactory(config.theme, 'd3-context-menu-theme');

    /**
     * Context menu event handler
     * @param {*} data
     * @param {Number} index
     */
    return function (dx, ix) {
      const element = this,
            nodes = getSelectedNodes.bind(self)();

      // Close any open menus
      closeMenu();

      // Store close callback already bound to the correct args and scope
      d3ContextMenu = {
        boundCloseCallback: closeCallback.bind(element, dx, ix)
      };

      // Create the div element that will hold the context menu
      selectAll('.d3-context-menu').data([1])
        .enter()
        .append('div')
        .attr('class', 'd3-context-menu ' + themeFactory.bind(element)(dx, ix));

      // Close menu on mousedown outside of canvas
      select('body').on('mousedown.d3-context-menu', closeMenu);
      
      // Right-clicking menu closes it
      const gMenu = selectAll('.d3-context-menu')
        .on('contextmenu', function() {
          closeMenu();
          event.preventDefault();
          event.stopPropagation();
        });

      if (nodes.size()) {
        // Populate action menu
        const parent = gMenu.append('ul')
          .attr('class', 'action-menu');
        parent.call(createNestedMenu, element);
      } else {
        gMenu.html(
          `<div class="context-menu-empty">
            <p>There are no <span style="color: #0d77e2;">selected</span> nodes!</p>
            <ol>
              <li>Click on a node to (un)select it. Shift+click to select multiple nodes.</li>
              <li>Use the lasso or box selection tools on top of the canvas.</li>
            </ol>
            <p>Selecting nodes allows you to expand, pin, or remove them.</p>
          </div>`
        );
      }

      // The openCallback allows an action to fire before the menu is displayed
      // an example usage would be closing a tooltip
      if (openCallback.bind(element)(dx, ix) === false) {
        return;
      }

      // Get position and display context menu
      const position = positionFactory.bind(element)(dx, ix);
      select('.d3-context-menu')
        .style('left', (position ? position.left : event.pageX - 2) + 'px')
        .style('top', (position ? position.top : event.pageY - 2) + 'px')
        .style('display', 'block');

      event.preventDefault();
      event.stopPropagation();

      function createNestedMenu(parent, root, depth=0) {
        const resolve = function (value) {
          return utils.toFactory(value).call(element, dx, ix, nodes);
        };

        parent.selectAll('li')
          .data(function (d) {
            const baseData = depth === 0 ? actionMenuItems : d.children;
            return resolve(baseData);
          })
          .enter()
          .append('li')
          .each(function (d) {
            // Parse data objects
            const isDivider = !!resolve(d.divider);
            const hasChildren = !!resolve(d.children);
            const hasAction = !!d.action;
            const hasIcon = !!resolve(d.icon);
            const icon = hasIcon ? `<img src=${d.icon}>` : '';
            const text = isDivider ? '<hr>' : `<p class="${hasIcon ? '' : 'context-menu-no-icon'}">${resolve(d.title)}</p>`;
            let code = resolve(d.code);
            const isDisabled = !!resolve(d.disabled) || code === 'disabled';
            code = (code === 'disabled' || code === undefined ) ? '' : `<p class="context-menu-code">${code}</p>`;

            const listItem = select(this)
              .classed('context-menu-divider', isDivider)
              .classed('context-menu-disabled', isDisabled)
              .classed('context-menu-header', !hasChildren && !hasAction)
              .classed('context-menu-parent', hasChildren)
              .html(`<div class="context-menu-left">${icon}${text}</div>${code}`)
              .on('click', function () {
                event.stopPropagation();
                // Do nothing if disabled or no action
                if (isDisabled || !hasAction) return;

                // Get selection, always pass in node id, only used when selecting current node
                d.action.call(root, nodes);
                closeMenu();
              });

            if (hasChildren) {
              // Create children(`next parent`) and call recursive
              const children = listItem.append('ul').classed('context-menu-children', true);
              createNestedMenu(children, root, ++depth)
            }
          });
      }
    };
  };
}
