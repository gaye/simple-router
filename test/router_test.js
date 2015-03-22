define((require) => {
'use strict';

var Router = require('router');
var assert = require('chai').assert;

suite('Router', () => {
  var router;

  setup(() => {
    var element = document.createElement('div');
    element.className = 'anchor';
    document.body.appendChild(element);
    router = new Router({
      anchorElement: element,
      defaultState: { count: 0 }
    });

    router.initView = (viewName) => {
      var view = document.createElement('div');
      view.textContent = viewName;
      return Promise.resolve(view);
    };

    router.route = (state) => state.count;

    return router.start();
  });

  teardown(() => {
    var element = anchorElement();
    element.parentNode.removeChild(element);
    document.location.hash = '';
  });

  test('initialization', () => {
    assert.equal(activeView().textContent, '0');
    assert.equal(document.location.hash, '#{"count":0}');
  });

  test('#getState', () => {
    assert.deepEqual(router.getState(), { count: 0 });
  });

  test('#setState', () => {
    return router.setState({ count: 1 }).then(() => {
      assert.equal(activeView().textContent, '1');
      assert.equal(document.location.hash, '#{"count":1}');
    });
  });
});

function activeView() {
  return anchorElement().firstChild;
}

function anchorElement() {
  return document.getElementsByClassName('anchor')[0];
}

});
