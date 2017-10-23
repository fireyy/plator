import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'

// TODO: use buble instead of babel
// TODO: use uglify.js to minify code

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
