module.exports = [
  {
    mode: 'production',
    target: 'web',
    entry: {
      index: './index.js'
    },
    output: {
      filename: 'guld-user.min.js',
      path: __dirname,
      library: 'guldUser',
      libraryTarget: 'var'
    }
  }
]
