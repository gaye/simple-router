/**
 * Usage:
 *
 *   ```
 *   var router = new Router({
 *     anchorElement: document.getElementById('anchor'),
 *     defaultState: { color: 'green' }
 *   });
 *
 *   router.route = state => state.color;
 *
 *   router.initView = (viewName) {
 *     var element = document.createElement('div');
 *     // ... initialize element
 *     return element;
 *   };
 *
 *   router.start();
 *   ```
 *
 */
define(function(require, exports, module) {
'use strict';

/**
 * Options:
 *
 *   - (Element) anchorElement
 *   - (Object) defaultState
 *   - (Function) initView
 *   - (Function) route
 */
function Router(options) {
  this.anchorElement = options.anchorElement;
  this.defaultState = options.defaultState || {};
  this.initView = options.initView;
  this.route = options.route;
  this._viewCache = new Map();
}

Router.prototype = {
  start: function() {
    window.onhashchange = () => {
      var state = readCache();
      if (!state) {
        return;
      }

      this.setState(state);
    };

    return this.setState(readCache() || this.defaultState);
  },

  getState: function() {
    return this._state;
  },

  setState: function(state) {
    if (deepEquals(state, this._state)) {
      return Promise.resolve();
    }

    this._state = state;
    return this._recompute();
  },

  /**
   * Default implementation.
   */
  show: function(view) {
    if (this.anchorElement.hasChildNodes()) {
      this.anchorElement.removeChild(this.anchorElement.firstChild);
    }

    this.anchorElement.appendChild(view);
  },

  _recompute: function() {
    var state = this._state;
    var dest = this.route(state);
    var buildView = this._viewCache.has(dest) ?
      Promise.resolve(this._viewCache[dest]) :
      this.initView(dest);
    return buildView.then(view => {
      this._viewCache.set(dest, view);
      this.show(view);
      cacheState(this._state);
    });
  }
};

function cacheState(state) {
  window.location.hash = encodeURIComponent(JSON.stringify(state));
}

function readCache() {
  var result;
  try {
    var hash = window.location.hash;
    result = JSON.parse(decodeURIComponent(hash.substring(1)));
  } catch (error) {
    result = null;
  }

  return result;
}
Router.readCache = readCache;

function deepEquals(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== 'object') {
    return a === b;
  }

  if (!arrayEquals(Object.keys(a).sort(), Object.keys(b).sort())) {
    return false;
  }

  return Object.keys(a).every(function(key) {
    return deepEquals(a[key], b[key]);
  });
}

function arrayEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every(function(value, index) {
    return a[index] === b[index];
  });
}

module.exports = Router;

});
