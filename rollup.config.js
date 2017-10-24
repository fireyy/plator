import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'

const info = require('./package.json')

const config = {
  useStrict: false,
  sourceMap: false,
  entry: 'src/plator.js',
  plugins: [
    postcss({
      plugins: [
        require('postcss-cssnext')(),
        require('postcss-inline-svg')(),
        require('cssnano')({
          autoprefixer: false
        })
      ],
      extract: 'dist/plator.css',
      extensions: ['.css', '.pcss']
    }),
    resolve(),
    buble()
  ],
  targets: [
    {
      dest: info.main,
      format: 'umd',
      moduleName: 'Plator'
    }, {
      dest: info.module,
      format: 'es'
    }
  ]
}

export default config
