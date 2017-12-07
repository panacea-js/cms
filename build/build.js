import { Nuxt, Builder, Generator } from 'nuxt'
import _ from 'lodash'
import { registerServices } from '@panaceajs/core/src/utils/DIContainer'
import path from 'path'
import fs from 'fs-extra'

/**
 * Prepares a nuxt build for build and live reload scripts.
 *
 * @param {*} params
 *   Panacea application specific options mirroring the same structure
 *   as nuxt.config.js.
 */
export default function (params = {}) {
  // Register Panacea Core's services to instantiate global container.
  registerServices(params)

  const { options } = DI.container

  // Load defaults nuxt.config.js and override with options passed in.
  const nuxtConfigFile = require('../nuxt.config.js')
  const config = _.defaultsDeep(params, _.cloneDeep(options), nuxtConfigFile)

  // Ensure root directory is considered the parent directory and not
  // the directory where this script is included from.
  config.rootDir = path.resolve(__dirname, '..')
  config.srcDir = path.resolve(__dirname, '..')

  // Ensure the router knows about the set public path,
  config.router = config.router || {}
  config.router.base = config.panacea.cms.build.publicPath

  config.build.publicPath = config.panacea.cms.build.publicPath

  // Append the compiled configuration from Panacea Core's is made
  // available to both client and server.
  const configExcludingEnv = _.cloneDeep(config)
  config.env = config.env || {}
  config.env.panacea = configExcludingEnv

  const cmsCustomOverridesDir = path.resolve(process.cwd(), 'cms')

  mergeNuxtAssets(config.rootDir, cmsCustomOverridesDir)

  const nuxt = new Nuxt(config)
  const builder = new Builder(nuxt)

  return {
    nuxt,
    builder,
    config
  }

}

const mergeNuxtAssets = function (rootDir, cmsCustomOverridesDir) {

  const availableMergeDirectories = [
    'assets',
    'components',
    'layouts',
    'middleware',
    'pages',
    'plugins',
    'static',
    'store'
  ]

  const customOverrideDirExists = (dir) =>
    fs.pathExistsSync(
      path.resolve(cmsCustomOverridesDir, dir)
    )

  const originalDirDoesNotExist = (dir) =>
    !fs.pathExistsSync(
      path.resolve(rootDir, `${dir}.original`)
    )

  const createOriginalDir = dir => {
    fs.copySync(
      path.resolve(rootDir, dir),
      path.join(rootDir, `${dir}.original`)
    )
    return dir
  }

  const mergeCustomDirectoryToRoot = (dir) =>
    fs.copySync(
      path.resolve(cmsCustomOverridesDir, dir),
      path.join(rootDir, dir)
    )

  // Create .original directories for each of the nuxt custom
  // override directories if they don't exist.
  availableMergeDirectories
    .filter(customOverrideDirExists)
    .filter(originalDirDoesNotExist)
    .map(createOriginalDir)

  // Merge nuxt custom overrides to compilation root.
  availableMergeDirectories
    .filter(customOverrideDirExists)
    .map(mergeCustomDirectoryToRoot)
}
