# Plator

<p align="center">
  <a href="https://jsfiddle.net/fireyy/de9mgz8y/" target="_blank">
    <img src="Screen.png" width="500px">
    <br>
    Live Demo
  </a>
</p>

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

  * `type` The media type to pack, `video`/`audio` or `video, audio`, default to `video`.
  * `icons` Customize UI icons use svg.

      ```js
        {
          play: [
            '0 0 36 36',
            'M9.086 6c-.662 0-1.27.54-1.27 1.294v21.324c0 .755.608 1.295 1.27 1.295.214 0 .434-.057.641-.18L27.52 19.07c.834-.5.834-1.728 0-2.227L9.727 6.18a1.238 1.238 0 0 0-.64-.18',
            '36'
          ],
          pause: [
            '0 0 36 36',
            'M25.755 29.936h-3.59a1.197 1.197 0 0 1-1.197-1.197V7.197c0-.661.536-1.197 1.197-1.197h3.59c.661 0 1.197.536 1.197 1.197v21.542c0 .66-.536 1.197-1.197 1.197zm-11.968 0h-3.59A1.197 1.197 0 0 1 9 28.739V7.197C9 6.536 9.536 6 10.197 6h3.59c.661 0 1.197.536 1.197 1.197v21.542c0 .66-.536 1.197-1.197 1.197z',
            '36'
          ],
          ...
        }
      ```

  * `iconsColor` Color used by svg icon. Default `#fff`.
  * `full` Fullscreen type, `browser` or `web`. Default `web`.

### `setup()`
init function.
