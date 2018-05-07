import path from 'path'

const { options } = Panacea.container
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
    '@/plugins/filters.js'
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
        if (typeof config.entry.app !== 'undefined') {
          // Replace timeout of HMR to 1s instead of
          // 30s as hardcoded into nuxt's webpack client.config.js
          config.entry.app = config.entry.app.map(x => x.replace('timeout=30000', 'timeout=1000'))
        }
      }
    }
  },
  modules: [
    ['@nuxtjs/apollo'],
    ['nuxt-sass-resources-loader', [
      path.resolve(process.cwd(), '.compiled/cms/assets/colors.scss')
    ]]
  ],
  apollo: {
    clientConfigs: {
      default: '~/apollo/client-configs/panaceaGraphql.js',
      cmsLocalState: '~/apollo/client-configs/cmsLocalState.js'
    },
    includeNodeModules: true
  },
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
    middleware: []
  }
}
