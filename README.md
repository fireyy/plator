# Plator

> A simple HTML5 video/audio player.

## Install

This project uses [node](http://nodejs.org) and [npm](https://npmjs.com). Go check them out if you don't have them locally installed.

```sh
$ npm install --save plator
```

Then with a module bundler like [rollup](http://rollupjs.org/) or [webpack](https://webpack.js.org/), use as you would anything else:

```javascript
// using ES6 modules
import 'plator/dist/plator.css'
import plator from 'plator'

// using CommonJS modules
var plator = require('plator')
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<link rel="stylesheet" href="//unpkg.com/plator/dist/plator.css">
<script src="//unpkg.com/plator/dist/plator.js"></script>
```

This exposes the `Plator()` function as a global.

* * *

## Usage

```js
import plator from 'plator';

let plator = Plator({
  type: 'video, audio'
})
    plator.setup()
```

## Examples & Demos

[**Real Example on JSFiddle**](https://jsfiddle.net/fireyy/de9mgz8y/) ➡️

## API

Plator's API is organized as follows:

### `Plator(options: Object)`

Plator will account for the following properties in options:

  * `type` The media type to pack, `video`/`audio` or `video, audio`, default to `audio`.

### `setup()`
init function.
