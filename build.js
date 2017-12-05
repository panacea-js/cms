import { Nuxt, Builder, Generator } from 'nuxt'
import _ from 'lodash'
import { registerServices } from '@panaceajs/core/src/utils/DIContainer'

export default function (options = {}) {

  registerServices(options)

  // Load defaults nuxt.config.js and override with options passed in.
  const nuxtConfigFile = require('./nuxt.config.js')
  const config = _.defaultsDeep(_.cloneDeep(options), nuxtConfigFile)

  config.rootDir = __dirname
  config.srcDir = __dirname
  config.dev = false

  config.router = config.router || {}
  config.router.base = config.build.publicPath

  config.env = config.env || {}
  config.env.panacea = {
    services: DI.container.options
  }

  console.log(`Generating Panacea CMS at path ${config.build.publicPath} ...`)

  const nuxt = new Nuxt(config)
  new Builder(nuxt).build()

}
