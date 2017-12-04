import { Nuxt, Renderer } from 'nuxt'
import _ from 'lodash'

export default function (app, options) {
  // Load defaults nuxt.config.js and override with options passed in.
  const nuxtConfigFile = require('./nuxt.config.js')
  const config = _.defaultsDeep(_.cloneDeep(options.panacea.cms), nuxtConfigFile)

  config.router = config.router || {}
  config.env = config.env || {}

  config.router.base = config.build.publicPath
  config.rootDir = __dirname
  config.srcDir = __dirname
  config.dev = false
  config.env.test = '1234'
  const nuxt = new Nuxt(config)

  app.use(nuxt.render)
}