import path from 'path'

const { options } = DI.container
const publicPrefix = options.build.publicPath

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'panacea-cms',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Panacea Content Management System' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: path.join(publicPrefix, 'favicon.ico') }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.dev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|.nuxt)/
        })
      }
    }
  }
}
