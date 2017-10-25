import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import string from 'rollup-plugin-string'

const info = require('./package.json')

const config = {
  useStrict: false,
  sourceMap: false,
  entry: 'src/plator.js',
  plugins: [
    postcss({
      plugins: [
        require('postcss-cssnext')(),
        require('cssnano')({
          autoprefixer: false
        })
      ],
      extract: 'dist/plator.css',
      extensions: ['.css', '.pcss']
    }),
    string({
      include: '**/*.svg'
    }),
    resolve(),
    buble()
  ],
  targets: [
    {
      dest: info.main,
      format: 'umd',
      moduleName: 'Plator'
    },
    {
      dest: info.module,
      format: 'es'
    }
  ]
}

if (process.env.NODE_ENV === 'development') {
  config.plugins.push(
    require('rollup-plugin-serve')({
      contentBase: __dirname,
      host: 'localhost',
      port: 3000,
      open: false
    })
  )
}

export default config
