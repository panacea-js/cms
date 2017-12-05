import { Nuxt, Builder, Generator } from 'nuxt'
import _ from 'lodash'
import { registerServices } from '@panaceajs/core/src/utils/DIContainer'
import path from 'path'

/**
 * Prepares a nuxt build for build and live reload scripts.
 * 
 * @param {*} options
 *   Panacea application specific options mirroring the same structure
 *   as nuxt.config.js.
 */
export default function (options = {}) {
  // Register Panacea Core's services to instantiate global container.
  registerServices(options)

  // Load defaults nuxt.config.js and override with options passed in.
  const nuxtConfigFile = require('../nuxt.config.js')
  const config = _.defaultsDeep(_.cloneDeep(options), nuxtConfigFile)

  // Ensure root directory is considered the parent directory and not
  // the directory where this script is included from.
  config.rootDir = path.resolve(__dirname, '..')
  config.srcDir = path.resolve(__dirname, '..')

  // Ensure the router knows about the set public path,
  config.router = config.router || {}
  config.router.base = config.build.publicPath

  // Append the compiled configuration from Panacea Core's is made
  // available to both client and server.
  config.env = config.env || {}
  config.env.panacea = {
    services: DI.container.options
  }

  const nuxt = new Nuxt(config)
  const builder = new Builder(nuxt)

  return {
    nuxt,
    builder,
    config
  }
}
