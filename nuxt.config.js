import path from 'path'

const { options } = DI.container
const publicPrefix = options.cms.build.publicPath

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
      { rel: 'icon', type: 'image/x-icon', href: path.join(publicPrefix, 'favicon.ico') },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: options.cms.vars.colors.primary },
  plugins: [
    '@/plugins/i18n.js',
    '@/plugins/vuetify.js',
    '@/plugins/filters.js',
    '@/plugins/apollo.js'
  ],
  css: [
    '@/assets/style/app.styl'
  ],
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      'vue-i18n',
      '@/plugins/vuetify.js'
    ],
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|.nuxt)/
        })
      }
      config.module.rules.push({
        test: /\.(gql|graphql)$/,
        loader: 'graphql-tag/loader'
      })
    }
  },
  modules: [
    ['nuxt-sass-resources-loader', [
      path.resolve(process.cwd(), '.compiled/cms/assets/colors.scss')
    ]]
  ],
  vars: {
    colors: {
      primary: '#bada55',
      secondary: '#661b87',
      accent: '#ca372a',
      error: '#ca372a',
      success: '#bada55'
    }
  },
  router: {
    middleware: [
      'i18n',
      'redirects'
    ]
  }
}
