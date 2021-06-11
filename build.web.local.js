const flow = require('esbuild-plugin-flow');
const alias = require('esbuild-plugin-alias');

// esbuild --bundle ./src/index.ts --outfile=./web/bundle.js --resolve-extensions=.web.tsx,.web.ts,.web.jsx,.web.js,.tsx,.ts,.jsx,.js --loader:.js=jsx '--define:process.env.NODE_ENV="production"' --tsconfig=tsconfig.json --minify --sourcemap

//build-web
require('esbuild')
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    target: ['es2017'],
    format: 'esm',
    outfile: '../crowdpoint-admin/admin-ui/node_modules/@tesseractcollective/react-graphql/dist/src/index.js',
    // outfile: '../purco/node_modules/@tesseractcollective/react-graphql/dist/src/index.js',
    tsconfig: './tsconfig-web.local.json',
    define: { 'process.env.NODE_ENV': '"production"', __DEV__: false, global: 'window' },
    resolveExtensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'], //This takes into account priority, so it will resolve a .web.tsx of the same file name before a .tsx if it exists
    loader: { '.png': 'file', '.ttf': 'file', '.js': 'jsx' },
    minify: false,
    sourcemap: true,
    external: [
      'react-native',
      'react',
      'react-dom',
      'react-native-web',
      'react-scripts',
      'urql',
      'jotai',
      'graphql',
      'graphql-tag',
      'case',
      'react-data-table-component',
      'react-scroll-trigger',
      'styled-components',
      'graphql',
      'graphql-tag',
      'lodash',
      'jotai'
    ],
    plugins: [
      // flow(/node_modules\\react-native-gesture-handler.*\.jsx?$/),
      alias({
        'react-native': require.resolve('react-native-web'),
      }),
    ],
    // watch: true
  })
  .catch(() => process.exit(1));
