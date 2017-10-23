import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'

const info = require('./package.json')

const config = {
  entry: 'src/plator.js',
  plugins: [
    postcss({
      plugins: [
        require('postcss-cssnext')(),
        require('postcss-inline-svg')()
      ],
      extract: 'dist/plator.css',
      extensions: ['.css', '.sss']
    }),
    resolve(),
    babel({
      babelrc: false,
      presets: [
        [
          'env', {
            modules: false,
            targets: {
              browsers: ['last 2 versions']
            }
          }
        ]
      ]
    })
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
