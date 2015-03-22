simplerouter
============

Yet another client-side js router!

### Usage

```js

var router = new Router({
  anchorElement: document.getElementById('anchor'),
  defaultState: { color: 'green' }
});

router.route = state => state.color;

router.initView = viewName => {
  var element = document.createElement('div');
  // ... initialize element
  return element;
};

router.start().then(() => {
  router.setState({ color: 'yellow' });  // Go to yellow page.
});

```
