import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

// eslint-config-next v16 exports native flat configs (arrays). The previous
// setup used FlatCompat + `extends('next/core-web-vitals')`, which made the
// legacy eslintrc validator re-wrap an already-flat object and crash ESLint 9
// with "Converting circular structure to JSON".
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'public/sw.js',
      'public/workbox-*.js',
    ],
  },
]

export default eslintConfig
