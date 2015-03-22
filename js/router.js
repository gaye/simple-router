define((require, exports, module) => {
'use strict';

let _ = require('lodash');

class Router {
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
   * Options:
   *
   *   - (Element) anchorElement
   *   - (Object) defaultState
   *   - (Function) initView
   *   - (Function) route
   */
  constructor(options={}) {
    this.anchorElement = options.anchorElement;
    this.defaultState = options.defaultState || {};
    this.initView = options.initView;
    this.route = options.route;
    this._viewCache = new Map();
  };

  start() {
    window.onhashchange = () => {
      let state = readCachedState();
      if (state === null) {
        return;
      }

      this.setState(state);
    };

    return this.setState(readCachedState() || this.defaultState);
  };

  setState(state) {
    if (_.isEqual(state, this._state)) {
      return Promise.resolve();
    }

    this._state = state;
    return this._recompute();
  };

  getState() {
    return this._state;
  };

  /**
   * Default implementation.
   */
  show(view) {
    if (this.anchorElement.hasChildNodes()) {
      this.anchorElement.removeChild(this.anchorElement.firstChild);
    }

    this.anchorElement.appendChild(view);
  };

  _recompute() {
    let state = this._state;
    let dest = this.route(state);
    let buildView;
    if (this._viewCache.has(dest)) {
      buildView = Promise.resolve(this._viewCache[dest]);
    } else {
      buildView = this.initView(dest);
    }

    return buildView.then(view => {
      this._viewCache.set(dest, view);
      this.show(view);
      cacheState(this._state);
    });
  };
}

function readCachedState() {
  let result;
  try {
    let hash = window.location.hash;
    result = JSON.parse(decodeURIComponent(hash.substring(1)));
  } catch (error) {
    result = null;
  }

  return result;
}

function cacheState(state) {
  window.location.hash = encodeURIComponent(JSON.stringify(state));
}

module.exports = Router;

});
