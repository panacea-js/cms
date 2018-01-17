import { Nuxt } from 'nuxt'
import _ from 'lodash'

export default function (app, options) {
  // Load defaults nuxt.config.js and override with options passed in.
  const nuxtConfigFile = require('./nuxt.config.js')

  const config = _.defaultsDeep(_.cloneDeep(options.cms), nuxtConfigFile)

  // Ensure the router knows about the set public path.
  config.router = config.router || {}
  config.router.base = config.build.publicPath
  config.rootDir = __dirname
  config.srcDir = __dirname
  config.dev = false

  // Append the compiled configuration from Panacea Core's is made
  // available to both client and server. Cloned to prevent circular referencing.
  const configExcludingEnv = _.cloneDeep(config)
  config.env = config.env || {}
  config.env.panacea = options
  config.env.cms = configExcludingEnv

  const nuxt = new Nuxt(config)

  app.use(nuxt.render)
}